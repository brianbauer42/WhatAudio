import { Component } from 'react';
import { api } from '../api.js';

class SearchBox extends Component {
  constructor(props) {
    super(props);
    this.state = { search: '' };

    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleSearchChange(event) {
    this.setState({ search: event.target.value });
  }

  handleSubmit(event) {
    event.preventDefault();
    api
      .get('/songs/search', { params: { q: this.state.search } })
      .then((response) => this.props.setPosts(response.data))
      .catch(() => this.props.setPosts([]));
  }

  render() {
    return (
      <div className="searchContainer">
        <form className="searchForm" onSubmit={this.handleSubmit}>
          <input
            type="text"
            value={this.state.search}
            onChange={this.handleSearchChange}
            placeholder="search"
            aria-label="Search tracks"
          />
          <input type="submit" className="invisible" />
        </form>
      </div>
    );
  }
}

export default SearchBox;
