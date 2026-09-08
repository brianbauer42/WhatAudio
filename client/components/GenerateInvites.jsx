import { Component } from 'react';
import { api, errorMessage } from '../api.js';

const formatDate = (value) => {
  if (!value) {
    return 'an unknown date';
  }
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'an unknown date' : date.toLocaleDateString();
};

class GenerateInvites extends Component {
  constructor(props) {
    super(props);

    this.state = {
      noteInput: '',
      inviteCodes: [],
      errorMsg: '',
    };

    this.handleGenerateInvite = this.handleGenerateInvite.bind(this);
    this.handleNoteChange = this.handleNoteChange.bind(this);
  }

  componentDidMount() {
    api
      .get('/invites/getmine')
      .then((response) =>
        this.setState({ inviteCodes: Array.isArray(response.data) ? response.data : [] })
      )
      .catch((error) => this.setState({ errorMsg: errorMessage(error) }));
  }

  handleNoteChange(event) {
    this.setState({ noteInput: event.target.value });
  }

  handleGenerateInvite(event) {
    event.preventDefault();
    api
      .post('/invites/generate', { note: this.state.noteInput })
      .then((response) => {
        this.setState((state) => ({
          noteInput: '',
          errorMsg: '',
          inviteCodes: [response.data, ...state.inviteCodes],
        }));
      })
      .catch((error) => this.setState({ errorMsg: errorMessage(error) }));
  }

  inviteCards(claimed) {
    return this.state.inviteCodes
      .filter((invite) => Boolean(invite.wasClaimed) === claimed)
      .map((invite) => (
        <div
          className={claimed ? 'unavailableInviteCards' : 'availableInviteCards'}
          key={invite._id}
        >
          Code: {invite.code}
          <br />
          Note: {invite.note}
          {claimed ? (
            <>
              <br />
              Claimed by {invite.claimedBy?.displayName ?? 'someone'} on{' '}
              {formatDate(invite.claimedBy?.dateRegistered)}
            </>
          ) : null}
          <br />
          <br />
        </div>
      ));
  }

  render() {
    return (
      <div className="adminContainer">
        <h2>Generate Invite Codes</h2>
        <h4>Sharing is better with friends!</h4>
        <form onSubmit={this.handleGenerateInvite}>
          <div>
            <label htmlFor="invite-note">Note:</label>
          </div>
          <div>
            <input
              id="invite-note"
              type="text"
              placeholder="note"
              value={this.state.noteInput}
              onChange={this.handleNoteChange}
            />
          </div>
          <button type="submit">Generate Code</button>
        </form>

        {this.state.errorMsg ? (
          <div className="errorContainer">
            <p>{this.state.errorMsg}</p>
          </div>
        ) : null}

        <div>
          <h3>Unclaimed invite codes:</h3>
          {this.inviteCards(false)}
        </div>
        <div>
          <h3>Redeemed invite codes:</h3>
          {this.inviteCards(true)}
        </div>
      </div>
    );
  }
}

export default GenerateInvites;
