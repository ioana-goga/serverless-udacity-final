
# Functionality of the application

This application will allow creating/removing/updating/fetching Projects and todo items.
A project can contain multiple todo items.
A TODO item is always associated to a project and can optionally have an attachment image.
Each user only has access to TODO items that he/she has created.

# Data model

Only one table is used to store both projects and todo items.
There are two common columns `hashK` and `rangeK` to store the hask, repectivly range keys for both types of objects.


## Projects
A project is uniquely identified through the combination of hash key and range key

- `hashK` (string) -  `user_name`
- `rangeK` (string) - `Project#project_created_at`
- `createdAt` (string) - date and time when an item was created
- `name` (string) - name of a project 
- `description` (string) - name of a project 

## TODOs
A todo item is uniquely identified through the combination of hash key and range key

- `hashK` (string) - contains `user_name#project_created_at`
- `rangeK` (string) - `Todo#todo_created_at`
- `createdAt` (string) - date and time when an item was created
- `name` (string) - name of a TODO item (e.g. "Change a light bulb")
- `dueDate` (string) - date and time by which an item should be completed
- `done` (boolean) - true if an item was completed, false otherwise
- `attachmentUrl` (string) (optional) - a URL pointing to an image attached to a TODO item


## Prerequisites

- <a href="https://manage.auth0.com/" target="_blank">Auth0 account</a>
- <a href="https://github.com" target="_blank">GitHub account</a>
- <a href="https://nodejs.org/en/download/package-manager/" target="_blank">NodeJS</a> version up to 12.xx
- Serverless
  - Create a <a href="https://dashboard.serverless.com/" target="_blank">Serverless account</a> user
  - Install the Serverless Framework’s CLI (up to VERSION=2.21.1). Refer to the <a href="https://www.serverless.com/framework/docs/getting-started/" target="_blank">official documentation</a> for more help.
  ```bash
  npm install -g serverless@2.21.1
  serverless --version
  ```
  - Login and configure serverless to use the AWS credentials
  ```bash
  # Login to your dashboard from the CLI. It will ask to open your browser and finish the process.
  serverless login
  # Configure serverless to use the AWS credentials to deploy the application
  # You need to have a pair of Access key (YOUR_ACCESS_KEY_ID and YOUR_SECRET_KEY) of an IAM user with Admin access permissions
  sls config credentials --provider aws --key YOUR_ACCESS_KEY_ID --secret YOUR_SECRET_KEY --profile serverless
  ```

# Functions 



- `Auth` - this function  implements a custom authorizer for API Gateway that should be added to all other functions.


- `GetProjects` - should return all the projects of the authenticated user. The default sort order is by createdAt descending (newest first).
The URL accepts an optional query parameter 'order' which in the current version of the implementation supports the value 'name'. In case this parameter is provided, the sort order is by project name ascending.

It should return data that looks like this:

```json
{
  "items": [
        "items": [
        {
            "hashK": "hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients",
            "createdAt": "2022-03-29T10:09:09.779Z",
            "description": "This is Project 1 updated",
            "name": "Project A ",
            "rangeK": "Project#2022-03-29T10:09:09.779Z"
        },
        {
            "hashK": "hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients",
            "createdAt": "2022-03-29T10:10:46.566Z",
            "description": "this project has been updated - project 3",
            "name": "Project B",
            "rangeK": "Project#2022-03-29T10:10:46.566Z"
        }
  ]
}
```

- `CreateProject` - creates a new project for a user. 

It receives a new project item to be created in JSON format that looks like this:

```json
{
    "name": "Project B",
    "description": "This is project B"
}
```

It returns a new project item that looks like this:

```json
{
    "item": {
        "hashK": "hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients",
        "rangeK": "Project#2022-04-09T10:40:55.453Z",
        "createdAt": "2022-04-09T10:40:55.453Z",
        "name": "Project B",
        "description": "This is project B"
    }
}
```


- `UpdateProject` - updates a project item created by a current user. 

It receives an object that contains three fields that can be updated in a project item:

```json
{
    "name": "Project A updated",
    "description": "This is Project A updated"
}
```

The identifier of an project that should be updated is passed as a URL path parameter. The identifier of a project is the project creation date.

It returns the updated project.


- `DeleteProject` - deletes a project and all its associated todo items. The identifier of an project (project creation date) that should be deleted is passed as a URL path parameter.

It returns the result of the delete operation (true or false).




- `GetTodos` - should return all TODO items for a project. The project creation date (the identifier of the project) is passed as a URL parameter.

It should return data that looks like this:

```json
{
  "items": [
        {
            "hashK": "hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients#2022-03-29T10:09:09.779Z",
            "attachmentUrl": "https://serverless-c4-todo-images-ig-dev.s3.eu-central-1.amazonaws.com/hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients_2022-03-29T10:09:09.779Z_2022-04-09T09:04:57.675Z",
            "rangeK": "Todo#2022-04-09T09:04:57.675Z",
            "dueDate": "2019-07-12",
            "createdAt": "2022-04-09T09:04:57.675Z",
            "name": "todo homework",
            "done": true
        },
        {
            "hashK": "hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients#2022-03-29T10:09:09.779Z",
            "attachmentUrl": "https://serverless-c4-todo-images-ig-dev.s3.eu-central-1.amazonaws.com/hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients_2022-03-29T10:09:09.779Z_2022-04-09T09:00:35.379Z",
            "rangeK": "Todo#2022-04-09T09:00:35.379Z",
            "dueDate": "2019-07-11",
            "createdAt": "2022-04-09T09:00:35.379Z",
            "name": "grocery shopping for p1 ",
            "done": false
        },
  ]
}
```

- `CreateTodo` - creates a new TODO for a project. 

It receives a new TODO item to be created in JSON format that looks like this:

```json
{
	"name": "cloths shopping for p1",
	"dueDate": "2019-07-11",
    "projectCreatedAt":"2022-03-29T10:09:09.779Z"
}
```

It returns a new TODO item that looks like this:

```json
{
   "item": {
        "hashK": "hWCgcxaHERRB8sHGVLz2vXCgVXKkflTw@clients#2022-03-29T10:09:09.779Z",
        "rangeK": "Todo#2022-04-09T10:28:55.133Z",
        "createdAt": "2022-04-09T10:28:55.133Z",
        "name": "cloths shopping for p1",
        "dueDate": "2019-07-11",
        "done": false
    }
}
```

- `UpdateTodo` - updates a TODO item created by a current user. A shape of data send by a client application to this function can be found in the `UpdateTodoRequest.ts` file

It receives an object that contains three fields that can be updated in a TODO item:

```json
{
    "dueDate": "2019-07-12",
    "name": "clothes shopping for p1 updated",
    "done": true
}
```

The identifier of an item that should be updated is passed as two URL paths parameters. The id is composed of the creation date of the project and the creation date of the todo item.

It returns the updated TODO item.


- `DeleteTodo` - deletes a TODO item created by a current user. The id of the todo items is passed as two path parameters. The id is composed of the creation date of the project and the creation date of the todo item.

It returns the result of the delete operation (true or false).

- `GenerateUploadUrl` - returns a pre-signed URL that can be used to upload an attachment file for a TODO item.

It returns a JSON object that looks like this:

```json
{
  "uploadUrl": "https://s3-bucket-name.s3.eu-west-2.amazonaws.com/image.png"
}
```

- `HandleImage` - it processes the upload event of an TODO image in s3 and saves the URL of this image to the corresponding TODO item in the database.




# How to run the application

## Backend

To deploy an application run the following commands:

```
cd backend
npm install
sls deploy -v
```

**Deploy a single function**

```
serverless deploy -f HandleImage # deploy a singe function
```


# Postman collection

An alternative way to test your API, you can use the Postman collection that contains sample requests. You can find a Postman collection in this project.
