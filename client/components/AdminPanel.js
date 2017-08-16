import React, { Component } from 'react';
import ShareForm from './ShareForm';
import GenerateUsers from './GenerateUsers';

class AdminPanel extends Component {
    render() {
        return (
            <div className="adminPage">
                <ShareForm history={this.props.history}/>
                <GenerateUsers />
            </div>
        );
    }
}

export default AdminPanel;