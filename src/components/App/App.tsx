import React, { PureComponent } from 'react';

import { WorkloadListContainer } from '../WorkloadList';
import { WorkloadFormContainer } from '../WorkloadForm';
import './App.css';


class App extends PureComponent {
  render() {
    return (
      <div className="wrapper">
        <div className="title">
          <h1>CloudWork</h1>
          <hr className="addColor"/>
        </div>

        <div className="list">
          <h2>Workloads</h2>
          <WorkloadListContainer />
        </div>
        
        <div className="creator">
          <WorkloadFormContainer />
        </div>

      </div>
    );
  }
}

export default App;
