import React, { useState, useContext, useEffect } from "react";
import TodoItem from "./TodoItem";
import TodoService from "../services/TodoService";
import Message from "./Message";
import { AuthContext } from "../context/AuthContext";

export default function Todos() {
  const [todo, setTodo] = useState({ name: "" });

  // we have this state below for using this variable to get our todo from
  // our database
  const [todos, setTodos] = useState([]);

  // we set 'null' to symbolize thta we don't want to render a message component
  const [message, setMessage] = useState(null);
  const authContext = useContext(AuthContext);

  // now we are goning to create a todo service which is going to fetch todos
  // and allow us to create todo

  useEffect(() => {
    TodoService.getTodos().then((data) => {
      setTodos(data.todos);
    });
  }, []);

  const onSubmit = (e) => {
    e.preventDefault();
    TodoService.postTodo(todo).then((data) => {
      const { message } = data;
      resetForm();

      // if this message.msgError is false, we want to get all the todos
      if (!message.msgError) {
        // this should give us the updated list of todos since we successfully
        // create a todo
        TodoService.getTodos().then((getData) => {
          setTodos(getData.todos);

          // setMessage(message) should give us a message that we have sucessfully
          // create this todo
          setMessage(message);
        });

        // message.msgBody === "UnAuthorized" means the JWT token has expired
        // basically if we get into this if else statement
      } else if (message.msgBody === "UnAuthorized") {
        // this setMessage(message); should be error message
        setMessage(message);

        // what authContext.setUser is doing is resetting the user since the JWT
        // token has been no longer valid
        authContext.setUser({ username: "", role: "" });
        authContext.setIsAuthenticated(false);
      } else {
        // here setMessage(message) is sending an error message. this will be like
        // if the client is trying to send an empty string to the backend
        // The backend will say "hey you can't do that"
        setMessage(message);
      }
    });
  };

  const onChange = (e) => {
    setTodo({ name: e.target.value });
  };

  const resetForm = () => {
    setTodo({ name: "" });
  };

  return (
    //   we display our todo in an unorder list
    <div>
      <ul className="list-group">
        {todos.map((todo) => {
          // todo._id gaurantees to be unique since it's got from database
          // then we just pass todo as prop, todo={todo}
          return <TodoItem key={todo._id} todo={todo} />;
        })}
      </ul>
      <br />
      <form onSubmit={onSubmit}>
        <label htmlFor="todo">Enter Todo</label>
        <input
          type="text"
          name="todo"
          value={todo.name}
          onChange={onChange}
          className="form-control"
          placeholder="Please Enter Todo"
        />
        <button className="btn btn-lg btn-primary btn-block" type="submit">
          Submit
        </button>
      </form>
      {message ? <Message message={message} /> : null}
    </div>
  );
}
