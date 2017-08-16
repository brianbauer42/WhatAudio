import React, { Component } from 'react';
import axios from 'axios';

class GenerateUsers extends Component {
    constructor(props) {
        super(props);

        this.state = {
            noteInput: '',
            inviteCodes: []
        }
        
        this.handleGenerateUser = this.handleGenerateUser.bind(this);
        this.handleNoteChange = this.handleNoteChange.bind(this);
        this.getAvailableInviteCodes = this.getAvailableInviteCodes.bind(this);
        this.availableInviteCards = this.availableInviteCards.bind(this);
        this.unavailableInviteCards = this.unavailableInviteCards.bind(this);
        this.handleInviteCodeDeletion = this.handleInviteCodeDeletion.bind(this);
    }

    componentDidMount() {
        this.getAvailableInviteCodes();
    }

    getAvailableInviteCodes() {
        axios.get("/api/invites/getmine").then((result) => {
            console.log("got invites result", result);
            if (result.data) {
                this.setState({ inviteCodes: result.data });
            }
        });
    }

    handleNoteChange(e) {
        this.setState({noteInput: e.target.value});
    }

    handleGenerateUser(e) {
        e.preventDefault();
        axios.post("/api/invites/generate", {
            note: this.state.noteInput
        }).then((result) => {
            var newInviteState = this.state.inviteCodes;
            newInviteState.push(result.data);
            this.setState({
                noteInput: '',
                inviteCodes: newInviteState
            });
            console.log("updated this.state", this.state);
        });
    }

    handleInviteCodeDeletion(id) {
        console.log("delete id:", id);
    }

    availableInviteCards() {
        if (this.state.inviteCodes) {
            return (
                this.state.inviteCodes.filter(item => {
                    if (item.wasClaimed === true) {
                        return false;
                    } else {
                        return true;
                    }
                }).map(code => (
                    <div className="availableInviteCards" key={code._id}>
                        Code: {code.code}
                        <br />
                        Note: {code.note}
                        <br />
                        <br />
                    </div>
                ))
            )
        }
    }

    unavailableInviteCards() {
        if (this.state.inviteCodes) {
            return (
                this.state.inviteCodes.filter(item => {
                    if (item.wasClaimed === false) {
                        return false;
                    } else {
                        return true;
                    }
                }).map(code => (
                    <div className="unavailableInviteCards" key={code._id}>
                        Code: {code.code}
                        <br />
                        Note: {code.note}
                        <br />
                        Claimed by {code.claimedBy.displayName} on {code.claimedBy.dateRegistered.toString()}
                        <br />
                        <br />
                    </div>
                ))
            )
        }
    }

    render() {
        return (
            <div className="adminContainer">
                <h2>Generate Invite Codes</h2>
                <h4>Sharing is better with friends!</h4>
                <form onSubmit={ this.handleGenerateUser } id='newInviteCodeForm'>
                    <div>
                        <label>Note:</label>
                    </div>
                    <div>
                        <input type='text'
                            placeholder="note"
                            value={this.state.noteInput}
                            onChange={this.handleNoteChange}   
                        />
                    </div>
                    <button type="submit">Generate Code</button>
                </form>
                <div>
                    <h3> Unclaimed invite codes: </h3>
                    {this.availableInviteCards()}
                </div>
                <div>
                    <h3> Redeemed invite codes: </h3>
                    {this.unavailableInviteCards()}
                </div>
            </div>
        )
    }
}

export default GenerateUsers;