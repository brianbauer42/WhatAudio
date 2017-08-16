import React, { Component } from 'react';
import ShareForm from './ShareForm';
import GenerateInvites from './GenerateInvites';

class AdminPanel extends Component {
    render() {
        return (
            <div className="adminPage">
                <ShareForm history={this.props.history}/>
                <GenerateInvites />
            </div>
        );
    }
}

export default AdminPanel;