import React, { Component } from 'react';

class StandardTrackCard extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        return (
            <div className={this.props.generateClassName(this.props.track)} key={this.props.track._id} onClick={(e) => this.props.handleTrackSelection(this.props.track, e)} >
                <div className="artContainer">
                    <img className="albumArt" src={this.props.track.artUri !== undefined ? 'resources/' + this.props.track.artUri : '/favicon.ico'} alt="album cover" />
                </div>
                <div className="postBody">
                    <h4 className="trackTitle">{this.props.track.artist} - {this.props.track.title}</h4>
                    <h5 className="albumTitle">{this.props.track.album}</h5>
                    <p className="postBodyText">{this.props.track.postBody}</p>
                    <p className="postAuthor">- {this.props.track.sharedBy.displayName}</p>
                </div>
                {this.props.isLoggedIn() ? 
                    <div className="postButtonsContainer">
                        <i className='fa fa-pencil-square-o fa-lg colorClick postEditButton' onClick={this.props.toggleEditTrackCard.bind(this, this.props.track) } />
                        <i className='fa fa-times fa-lg colorClick postDeleteButton' onClick={this.props.toggleDeleteTrackCard.bind(this, this.props.track) } />
                    </div>
                : null }
            </div>
        )
    }
}

export default StandardTrackCard;