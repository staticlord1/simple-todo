import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { withTracker } from 'meteor/react-meteor-data';
import { Helmet } from "react-helmet";
import  Timer  from 'react-compound-timer';
import { Tasks } from '../api/tasks.js';
import Task from './Task.js';

// App component - represents the whole app
class App extends Component {
  constructor(props) {
    super(props);
 
    this.state = {
      hideCompleted: false,
    };
  }

  handleSubmit(event) {
    event.preventDefault();
 
    // Find the text field via the React ref
    const text = ReactDOM.findDOMNode(this.refs.textInput).value.trim();
 
    Tasks.insert({
      text,
      createdAt: new Date(), // current time
    });
 
    // Clear form
    ReactDOM.findDOMNode(this.refs.textInput).value = '';
  }

  toggleHideCompleted() {
    this.setState({
      hideCompleted: !this.state.hideCompleted,
    });
  }
 
  renderTasks() {
    let filteredTasks = this.props.tasks;
    if (this.state.hideCompleted) {
      filteredTasks = filteredTasks.filter(task => !task.checked);
    }
    return filteredTasks.map((task) => (
      <Task key={task._id} task={task} />
    ));
  }

  render() {
    return (
        <div className="container">
          <Helmet>
            <title>{`Todo List (${this.props.incompleteCount})`}</title>
          </Helmet>
          <header>
            <h1>Todo List ({this.props.incompleteCount})</h1>

            <Timer
              initialTime={60000 * 30}
              startImmediately={false}
              direction="backward"
              checkpoints={[
                {
                  time: 0,
                  callback: () => alert("Time's up!"),
                },
              ]}
            >
                {({ start, resume, pause, stop, reset, timerState }) => (
                    <React.Fragment>
                        <div>
                            <Timer.Minutes /> minutes
                            <Timer.Seconds /> seconds
                        </div>
                        <div>{timerState}</div>
                        <br />
                        <div>
                            <button onClick={start}>Start</button>
                            <button onClick={pause}>Pause</button>
                            <button onClick={resume}>Resume</button>
                            <button onClick={stop}>Stop</button>
                            <button onClick={reset}>Reset</button>
                        </div>
                    </React.Fragment>
                )}
            </Timer>
            <label className="hide-completed">
              <input type="checkbox" readOnly checked={this.state.hideCompleted} onClick={this.toggleHideCompleted.bind(this)}/>
              Hide Completed Tasks
            </label>

            <form className="new-task" onSubmit={this.handleSubmit.bind(this)}>
              <input type="text" ref="textInput" placeholder="Type to add new tasks"/>
            </form>
          </header>

          <table>
            <thead>
              <tr>
                <th>Task</th>
              </tr>
            </thead>
            <tbody>
              {this.renderTasks()}
            </tbody>
          </table>
        </div>
    );
  }
}

export default withTracker(() => {
  return {
    tasks: Tasks.find({}, { sort: { createdAt: -1 } }).fetch(),
    incompleteCount: Tasks.find({ checked: { $ne: true } }).count(),
  };
})(App);