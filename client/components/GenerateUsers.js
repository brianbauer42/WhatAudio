import React, { Component } from 'react';

class GenerateUsers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            note: ''
        }
        
        this.handleGenerateUser = this.handleGenerateUser.bind(this);
        this.handleNoteChange = this.handleNoteChange.bind(this);
    }

    handleNoteChange(e) {
        this.setState({note: e.target.value});
    }

    handleGenerateUser(e) {
        console.log("Invite code requested",
            "In the future this will create an empty user in MongoDB that can be claimed by the person who knows the mongoId",
            this.state.note);
        e.preventDefault();
    }

    render() {
        return (
            <div className="adminContainer">
                <h2>Generate Invite Code</h2>
                <form onSubmit={ this.handleGenerateUser }>
                    <div>
                        <label>Note:</label>
                    </div>
                    <div>
                        <input type='text'
                            placeholder="note"
                            value={this.state.note}
                            onChange={this.handleNoteChange}   
                        />
                    </div>
                    <button type="submit">Generate</button>
                </form>
                <div>
                    <h3>Active invite codes:</h3>
                    [note] - [code]    X
                    <br />
                    [note] - [code]    X
                    <br />
                    [note] - [code]    X
                </div>
            </div>
        )
    }
}

export default GenerateUsers;