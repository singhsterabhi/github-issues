import React, { Component } from "react";
import moment from "moment";
import "./App.scss";

class App extends Component {
  state = {
    searching: false,
    repository: "",
    repo: "",
    openIssues: "",
    pastOneDay: "",
    betOneToSeven: "",
    beforeSeven: ""
  };

  searchIssues = async () => {
    const url = this.state.repository;
    const urlp = url.split("/");
    console.log(urlp);

    let reqUrl = `https://api.github.com/search/issues?q=repo:${urlp[3]}/${
      urlp[4]
    }+type:issue+state:open`;

    let data = await fetch(reqUrl)
      .then(d => d.json())
      .catch(e => {
        console.log(e);
        alert("some error");
        return;
      });

    const openIssues = data["total_count"];

    let today = new Date();
    let day = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    let dayWrapper = moment(day)
      .toISOString()
      .split("T")[0];

    reqUrl = `https://api.github.com/search/issues?q=repo:${urlp[3]}/${
      urlp[4]
    }+created:>=${dayWrapper}+type:issue+state:open`;

    data = await fetch(reqUrl)
      .then(d => d.json())
      .catch(e => {
        console.log(e);
        alert("some error");
        return;
      });

    const pastOneDay = data["total_count"];

    day = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    dayWrapper = moment(day)
      .toISOString()
      .split("T")[0];
    reqUrl = `https://api.github.com/search/issues?q=repo:${urlp[3]}/${
      urlp[4]
    }+created:>=${dayWrapper}+type:issue+state:open`;

    data = await fetch(reqUrl)
      .then(d => d.json())
      .catch(e => {
        console.log(e);
        alert("some error");
        return;
      });

    if (!data["total_count"]) {
      console.log("Some error");
      alert("Some error");
      return;
    }

    const betOneToSeven = data["total_count"] - pastOneDay;
    const beforeSeven = openIssues - (betOneToSeven + pastOneDay);

    this.setState({
      repo: `${urlp[3]} - ${urlp[4]}`,
      openIssues,
      pastOneDay,
      betOneToSeven,
      beforeSeven
    });
  };

  handleSearch = e => {
    e.preventDefault();
    if (this.state.repository === "") {
      alert("Enter a repo url");
      return;
    }
    this.setState({
      searching: true,
      repo: "",
      openIssues: "",
      pastOneDay: "",
      betOneToSeven: "",
      beforeSeven: ""
    });
    this.searchIssues();
  };

  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  render() {
    return (
      <div className="app">
        <form onSubmit={this.handleSearch}>
          <input
            type="text"
            name="repository"
            value={this.state.repository}
            onChange={this.handleChange}
            placeholder="https://github.com/reactjs/reactjs.org"
          />
          <br />
          <button type="submit">Search</button>
        </form>

        {this.state.repo === "" ? (
          ""
        ) : (
          <table>
            <tbody>
              <tr>
                <td>Repo</td>
                <td>{this.state.repo}</td>
              </tr>
              <tr>
                <td>Total Open issues</td>
                <td>{this.state.openIssues}</td>
              </tr>
              <tr>
                <td>No. of open issues opened in past 24 hrs</td>
                <td>{this.state.pastOneDay}</td>
              </tr>
              <tr>
                <td>No. of open issues opened in past 1-7 days</td>
                <td>{this.state.betOneToSeven}</td>
              </tr>
              <tr>
                <td>No. of open issues opened more than 7 days ago</td>
                <td>{this.state.beforeSeven}</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  }
}

export default App;
