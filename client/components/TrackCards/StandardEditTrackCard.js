import React, { Component } from 'react';

class StandardEditTrackCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.generateClassName(this.props.track)} key={this.props.track._id} >
                <div className="artContainer" onClick={(e) => this.props.handleTrackSelection(this.props.track, e)} >
                    <img className="albumArt" src={this.props.track.artUri !== undefined ? 'resources/' + this.props.track.artUri : '/favicon.ico'} alt="album cover" />
                </div>
                <div className="postBody">
                    <form id="trackUpdateForm" className="trackUpdateForm" onSubmit={this.props.handleTrackUpdate}>
                        <h5>Artist: 
                        <input type='text' 
                            value={this.props.inputState.artist}
                            onChange={(e) => this.props.handleInputChange('artist', this.props.track._id, e)}
                        /> Title:  
                        <input type='text' 
                            value={this.props.inputState.title}
                            onChange={(e) => this.props.handleInputChange('title', this.props.track._id, e)}
                        />
                        </h5>
                        <h5>Album: 
                        <input type='text' 
                            value={this.props.inputState.album}
                            onChange={(e) => this.props.handleInputChange('album', this.props.track._id, e)}
                        />
                        </h5>
                        <input type='textarea' 
                        value={this.props.inputState.postBody}
                        onChange={(e) => this.props.handleInputChange('postBody', this.props.track._id, e)}
                        />
                        <p className="postAuthor">- {this.props.track.sharedBy.displayName}</p>
                        <button type="submit" onClick={this.props.handleEditPost.bind(this, this.props.track)} >Save Changes</button>
                    </form>
                </div>
                <div className="postButtonsContainer">
                    <i className='fa fa-pencil-square-o fa-lg colorClick postEditButton' onClick={this.props.toggleEditTrackCard.bind(this, this.props.track) } />
                    <i className='fa fa-times fa-lg colorClick postDeleteButton' onClick={this.props.toggleDeleteTrackCard.bind(this, this.props.track._id)} />
                </div>
            </div>
        )
    }
}

export default StandardEditTrackCard;