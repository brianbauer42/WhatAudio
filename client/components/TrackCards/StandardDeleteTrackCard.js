import React, { Component } from 'react';

class StandardDeleteTrackCard extends Component {
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
                    <h2 className="areYouSure">Are you sure you want to delete this track?</h2>
                    <h3 className="trackTitle">{this.props.track.artist} - {this.props.track.title}</h3><p className="postAuthor">Shared by: {this.props.track.sharedBy.displayName}</p>
                    <button type="button" className="redButton" onClick={this.props.handleDeletePost.bind(this, this.props.track._id)} >Delete!</button>
                    <button type="button" className="greenButton" onClick={this.props.toggleDeleteTrackCard.bind(this, this.props.track) }>Keep!</button>
                </div>
            </div>
        )
    }
}

export default StandardDeleteTrackCard;