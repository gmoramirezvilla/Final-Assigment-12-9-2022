const APIs = (() => {
    const URL = "http://localhost:3000/todos";

    const addTodo = (newTodo) => {
        // post
        return fetch(URL, {
            method: "POST",
            body: JSON.stringify(newTodo),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    };

    const removeTodo = (id) => {
        return fetch(URL + `/${id}`, {
            method: "DELETE",
        }).then((res) => res.json());
    };

    const getTodos = () => {
        return fetch(URL).then((res) => res.json());
    };

    const updateTodo = (id, updateChange) => {
        return fetch(URL + `/${id}`, {
            method: "PATCH",
            body: JSON.stringify(updateChange),
            headers: { "Content-Type": "application/json" },
        }).then((res) => res.json());
    }
    return {
        addTodo,
        removeTodo,
        getTodos,
        updateTodo,
    };
})();

const Model = (() => {
    //todolist
    class State {
        #todos; //[{id: ,title: },{}]
        #onChange;
        #curUpdate;
        constructor() {
            this.#todos = [];
            this.#curUpdate = -1;
        }

        get todos() {
            return this.#todos;
        }

        set todos(newTodo) {
            console.log("setter");
            this.#todos = newTodo;
            this.#onChange?.();
        }


        get curUpdate(){
            return this.#curUpdate;
        }

        set curUpdate(newcurUpdate) {
            console.log("update");
            this.#curUpdate = newcurUpdate;
            this.#onChange?.();
        }

        subscribe(callback) {
            this.#onChange = callback;
        }
    }
    let { getTodos, removeTodo, addTodo, updateTodo, } = APIs;

    return {
        State,
        getTodos,
        removeTodo,
        addTodo,
        updateTodo,
    };
})();
//BEM, block element modifier methodology
const View = (() => {
    const formEl = document.querySelector(".form"); //querying
    const todoListEl = document.querySelector(".todo-list");
    const updateTodoList = (todos, curUpdate) => {
        let template = "";
        let undoneList = "";
        let doneList = "";
        
        todos.forEach((todo) => {
            let todoTemplate = 0;
            if(todo.complete == false){
                if(curUpdate != todo.id){
                    todoTemplate = `<li><span class="txt-undone" id="${todo.id}">${todo.title}</span><button class="btn--update" id="${todo.id}">update</button><button class="btn--delete" id="${todo.id}">remove</button></li>`;
                }
                else{
                    todoTemplate = `<li><input class="txt--update" type="text" name="NEWSTRINGINPUT" value=${todo.title}><button class="btn--update" id="${todo.id}">update</button><button class="btn--delete" id="${todo.id}">remove</button></li>`; 
    
                }
                undoneList += todoTemplate
            }
            else{
                todoTemplate = `<li class="txt-done" id="${todo.id}"><span id="${todo.id}"><del  class="txt-done" id="${todo.id}">${todo.title}<del></span><button class="btn--delete" id="${todo.id}">remove</button></li>`;
                doneList += todoTemplate;
            }
        });
        template = undoneList + '<li>Completed Tasks</li>' + doneList;
        if(todos.length === 0){
            template = "no task to display"
        }
        todoListEl.innerHTML = template;
    };

    return {
        formEl,
        todoListEl,
        updateTodoList,
    };
})();

//reference: pointer
//window.console.log

//

/* 
    prevent the refresh
    get the value from input
    save the new task to the database(could fail)
    save new task object to state, update the page
    
*/

const ViewModel = ((View, Model) => {
    console.log("model", Model);
    const state = new Model.State();

    const getTodos = () => {
        Model.getTodos().then((res) => {
            state.todos = res;
        });
    };

    const addTodo = () => {
        View.formEl.addEventListener("submit", (event) => {
            event.preventDefault();
            
            const title = event.target[0].value;
            const complete = false;
            if(title.trim() === "") {
                alert("please input title!");
                return;
            }
            console.log("title", title);
            const newTodo = {title, complete};
            Model.addTodo(newTodo)
                .then((res) => {
                    state.todos = [res, ...state.todos];
                    event.target[0].value = ""
                })
                .catch((err) => {
                    alert(`add new task failed: ${err}`);
                });
        });
    };

    const removeTodo = () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            //console.log(event.target/* emit the event */, event.currentTarget/* receive the event */);
            const id = event.target.id;
            //console.log("id", id)
            if(event.target.className === "btn--delete"){
                Model.removeTodo(id).then(res=>{
                    state.todos = state.todos.filter(todo=> +todo.id !== +id)
                }).catch(err=>alert(`delete todo failed: ${err}`))
            }
        })
    };

    const startUpdateTodo = () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            event.preventDefault();
            //console.log(event.target/* emit the event */, event.currentTarget/* receive the event */);
            const id = event.target.id;
            if(event.target.className === "btn--update" && state.curUpdate != id){
                console.log("start update")
                state.curUpdate = id;
            }
        })
    };

    const updateTodo =  () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            event.preventDefault();
            const id = event.target.id;
            if (event.target.className === "btn--update" && state.curUpdate == id){
                console.log("update XXXXXX")
                const name = document.getElementsByName("NEWSTRINGINPUT")[0].value;
                const title = name;
                if(title.trim() === "") {
                    alert("please input title!");
                    return;
                }
                const updateTitle = {title};
                console.log(name);
                console.log(updateTitle);
                Model.updateTodo(id, updateTitle).then(res=>{
                    console.log("gotRes");
                    for(let i = 0; i <state.todos.length; i++){
                        if(state.curUpdate == state.todos[i].id){
                            state.todos[i] = res; 
                        }
                    }
                    state.curUpdate = -1;
               }).catch(err=>alert(`update failed failed: ${err}`))
            }
        })
    };

    const undoneTodo =  () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            event.preventDefault();
            if (event.target.className === "txt-undone"){
                console.log("Clicked on text");
                const id = event.target.id;
                const complete = true;
                const updateComplete = {complete};
                Model.updateTodo(id, updateComplete).then(res=>{
                    console.log("gotRes");
                    for(let i = 0; i <state.todos.length; i++){
                        if(id == state.todos[i].id){
                            state.todos[i] = res; 
                        }
                    }
                    View.updateTodoList(state.todos, state.curUpdate);
               }).catch(err=>alert(`update completion failed: ${err}`))
            }
        })
    };

    const doneTodo  =  () => {
        //event bubbling: event listener from parent element can receive event emitted from its child
        View.todoListEl.addEventListener("click",(event)=>{
            event.preventDefault();
            if (event.target.className === "txt-done"){
                console.log("Clicked on text");
                const id = event.target.id;
                const complete = false;
                const updateComplete = {complete};
                Model.updateTodo(id, updateComplete).then(res=>{
                    console.log("gotRes");
                    for(let i = 0; i <state.todos.length; i++){
                        if(id == state.todos[i].id){
                            state.todos[i] = res; 
                        }
                    }
                    View.updateTodoList(state.todos, state.curUpdate);
               }).catch(err=>alert(`update completion failed: ${err}`))
            }
        })
    };

    const bootstrap = () => {
        addTodo();
        getTodos();
        removeTodo();
        updateTodo();
        startUpdateTodo();
        doneTodo();
        undoneTodo();
        state.subscribe(() => {
            View.updateTodoList(state.todos, state.curUpdate);
        });
    };

    return {
        bootstrap,
    };
})(View, Model);


ViewModel.bootstrap();
