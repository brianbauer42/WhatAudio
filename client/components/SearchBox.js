 import React, { Component } from 'react';
 
 class SearchBox extends Component{
    constructor(props) {
        super(props);

        this.state = {
            search: ''
        }
    
        this.handleSearchChange = this.handleSearchChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    handleSearchChange(e) {
        this.setState({ search: e.target.value });
    }

    handleSubmit(e) {
        fetch("/api/songs/search?q=" + this.state.search, {
            method: "GET",
        }).then((result) => {
            return result.json();
        }).then((data) => {
            this.props.setPosts(data);
        })
        e.preventDefault();
    }

    render() {
        return (
            <div className="searchContainer">
                <form className="searchForm" id="searchForm" onSubmit={this.handleSubmit}> 
                    <input type="text"
                        value={this.state.search}
                        onChange={this.handleSearchChange}    
                        placeholder="search"
                    />
                    <input type="submit" className="invisible" />
                </form>
            </div>
        );
     }
 }
 
 export default SearchBox;