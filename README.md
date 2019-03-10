# Appolo Mongo Module

Mongo module for [`appolo`](https://github.com/shmoop207/appolo) built with [appolo-mongo](https://github.com/shmoop207/appolo-mongo) and [mongoose](https://mongoosejs.com/)

## Installation

```typescript
npm i @appolo/mongo
```

## Options
| key | Description | Type | Default
| --- | --- | --- | --- |
| `id` | `ModelRepository` injection id | `string`|  `modelRepository`|
| `connection` | mongo connection string | `string` | null |
| `config` | mongose [connection](https://mongoosejs.com/docs/connections.html#options) options | `object` | {} |
| `exitOnDisconnect` | `call process.exit on disconnect | `boolean` | false `|

### Default Connections  Options
| key  | Default
| --- | --- |
| `keepAlive` | `true` | 
| `useNewUrlParser` | `true`  |
| `useCreateIndex` | `true` |
| `autoReconnect` | `true` |
| `reconnectTries` | `Number.MAX_VALUE` |
| `reconnectInterval` | `500` |
in config/modules/all.ts

```typescript
import {MongoModule} from '@appolo/mongo';

export = async function (app: App) {
    await app.module(new MongoModule({connection:"mongo://mongo-connection-string"}));
    
}
```

## Usage
```typescript
import {define, singleton} from 'appolo'
import {schema,prop,Model,model,Ref,injectModel,Doc} from "@appolo/mongo";

@model()
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
    
    @prop(Address)
    address:Address
}

@schema()
export class Address{
    @prop({type:String})
    street:string
    
    @prop({type:String})
    city:string
}

@model()
@schema()
export class Comment{
    @prop({type:String})
    text:string
    
    @prop({ref:User})
    user:Ref<User>
}


@define()
@singleton()
export class SomeManager {

    @injectModel(User) userModel:Model<User>;

    async getUser(id:string): Promise<Doc<User>> {
        let user = await this.userModel.findById(id)

        return user;
    }
}

```
## Schema

### options
#### @schema(collectionName:string,options:SchemaOptions)
define new schema with collectionName and mongose schema [options](https://mongoosejs.com/docs/guide.html#options)
```typescript
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
    
    @prop(Address)
    address:Address
}
```
### prop
 The prop decorator define class property to the Mongoose [schema](https://mongoosejs.com/docs/api.html#Schematype) as a property
```typescript
@prop({ type:String })
firstName: string;
````

### sub document
define sumDocument

```typescript
@schema()
export class Address{
    @prop({type:String})
    street:string
    
    @prop({type:String})
    city:string
}


@schema()
export class User{
    @prop(Address)
    address:Address
}
```

### ref
add ref to  another mongoose schema
the ref schema must be defined as model with `model` 
```typescript
@model()
@schema()
export class User{
    @prop()
    name:string
}

@model()
@schema()
export class Comment{
    @prop({ref:User})
    user:Ref<User>
}
```

### arrays
define any field as array using `[]`
```typescript
@prop([ type: String ])
names?: string[];

@prop([Address])
addresses:Address[]

@prop([{ref:User}])
user:Ref<User>[]

```

### required
define required field
```typescript
@prop({ type:String ,required:true})
firstName: string;
````

### index
define index [field](https://mongoosejs.com/docs/api.html#schematype_SchemaType-index)
```typescript
@prop({ index: true })
name?: string;
```

### unique
define unique [field](https://mongoosejs.com/docs/api.html#schematype_SchemaType-unique) 
```typescript
@prop({ unique: true })
someId?: string;
```
### enum
define enum field
```typescript
enum Gender {
  MALE = 'male',
  FEMALE = 'female',
}
@prop({ enum: Gender })
gender?: Gender;

```

### default
define field with default
```typescript

@prop({ type: String,default:"myName" })
name?: string;

```


### validate 
validate using minlength / maxlength / match / min /max same as [mongoose](https://mongoosejs.com/docs/validation.html#built-in-validators)
```typescript
@prop({ minlength: 5, maxlength: 10, match: /[0-9a-f]*/ })
phone: string;
````

### custom validate 
or use custom validator same as [mongoose](https://mongoosejs.com/docs/validation.html#custom-validators)
```typescript
@prop({
    type: String,
    validate: {
        validator: function(v) {
            return /\d{3}-\d{3}-\d{4}/.test(v);
        }
    },
    message: props => `${props.value} is not a valid phone number!`
})
phone: string;
````

### virtual
define virtual getter setters as in [mongoose](https://mongoosejs.com/docs/api.html#schema_Schema-virtual)
```typescript
@prop()
firstName?: string;

@prop()
lastName?: string;

@virtual() // this will create a virtual property called 'fullName'
get fullName() {
  return `${this.firstName} ${this.lastName}`;
}
set fullName(full:string) {
  const [firstName, lastName] = full.split(' ');
  this.firstName = firstName;
  this.lastName = lastName;
}

```
### static method
define static method as in [mongoose](https://mongoosejs.com/docs/api.html#schema_Schema-static) 
the method will be created on the mongose model 
```typescript
@staticMethod()
static findByName(this: Model<User>, name: string) {
  return this.findOne({ name });
}
```

```typescript
@define()
@singleton()
export class SomeManager {

    @injectModel(User) userModel:Model<User> & typeof User;

    async getUser(name:string): Promise<Doc<User>> {
        let user = await this.userModel.findByName(name)

        return user;
    }
}
```
you need added the `typeof User` in order to use the static method `findByName`

### instance Method
define instance method as in [mongoose](https://mongoosejs.com/docs/api.html#schema_Schema-method)
instance methods are created on mongoose document

```typescript
@method()
addAge(this: Doc<User>,age?:number) {
  this.age = this.age + (age ||1 );
  return this.save();
}
```

### pre 
define mongoose pre [hooks](https://mongoosejs.com/docs/middleware.html)
the pre function will be executed before the defined hook 
```typescript
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
    
    @pre("save")
    private preSave(this:Doc<User>,next){
        if (this.name === 'aaa') {
            this.name = 'bbb';
        }
        next();
    }
}
```

### post 
define mongoose post [hooks](https://mongoosejs.com/docs/middleware.html)
the post function will be executed after the defined hook 
```typescript
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
    
    @post("save")
    private preSave(doc:Doc<User>,next){
          console.log('%s has been saved', doc._id);
          next();
    }
}
```

## Model
### define model
register new schema model
```typescript
@model()
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
}
```
### inject model
inject model to class
```typescript
@define()
@singleton()
export class SomeManager {

    @injectModel(User) userModel:Model<User>;

    async getUser(id:string): Promise<Doc<User>> {
        let user = await this.userModel.findById(id)

        return user;
    }
}
```
## Schema Api
### collectionName
get the defined collection name on schema
```typescript
@model()
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
}

User.collectionName // "user"

```
### getSchema
return mongoose schema object
```typescript
@model()
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
}

let schema  = User.getSchema() 

```

### getModel
define and mongoose model instance by mongoose connection
```typescript
@model()
@schema("User",{strict:true})
export class User{
    @prop({type:String})
    name:string
}

let model  = User.getModel<User>(mongoose.connection) 

model.findById("someId")

```
## ModelRepository
with modelRepository you can access to the mongoose connection and all the models

### connection
getter return mongoose connection

### getModel
#### getModel<T>(model: typeof Schema): Model<T>
return mongoose model by schema type
```typescript
@define()
@singleton()
export class SomeManager {

    @inject() modelRepository:ModelRepository;

    async getUser(id:string): Promise<Doc<User>> {
        let user = await this.modelRepository.getModel(User).findById(id)

        return user;
    }
}
```