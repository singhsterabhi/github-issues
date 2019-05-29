import React, { Component } from "react";
import moment from "moment";
import "./App.scss";
import fire from "./firebase";
import "firebase/database";
const database = fire.database();

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

  // To handle unexpected errors
  errorHandle = () => {
    console.log("Some error");
    alert("Some error");
    this.setState({ searching: false, repository: "" });
  };

  // search for the data with github api
  searchIssues = async () => {
    // to extract organisation and repository name
    const url = this.state.repository.split("/");

    // base url for searching open issues
    let reqUrl = `https://api.github.com/search/issues?q=repo:${url[3]}/${
      url[4]
    }+type:issue+state:open`;

    // GET request for total open issues
    let data = await fetch(reqUrl)
      .then(d => d.json())
      .catch(e => {
        console.log(e);
        this.errorHandle();
        return;
      });

    // getting total open issues
    const openIssues = data["total_count"];

    // calculation date 24hrs ago
    let today = new Date();
    let day = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    let dayWrapper = moment(day)
      .toISOString()
      .split("T")[0];

    // GET request for open issues created in past 24hrs
    data = await fetch(`${reqUrl}+created:>=${dayWrapper}`)
      .then(d => d.json())
      .catch(e => {
        console.log(e);
        this.errorHandle();
        return;
      });

    if (!data.hasOwnProperty("total_count")) {
      this.errorHandle();
      return;
    }

    // getting open issues created in past 24hrs
    const pastOneDay = data["total_count"];

    // calculation date 7 days ago
    day = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    dayWrapper = moment(day)
      .toISOString()
      .split("T")[0];

    // GET request for open issues created in past 7 days
    data = await fetch(`${reqUrl}+created:>=${dayWrapper}`)
      .then(d => d.json())
      .catch(e => {
        console.log(e);
        this.errorHandle();
        return;
      });

    // console.log(data);
    if (!data.hasOwnProperty("total_count")) {
      this.errorHandle();
      return;
    }

    // getting open issues created in past 1-7 days
    const betOneToSeven = data["total_count"] - pastOneDay;
    // getting open issues created in before 7 days
    const beforeSeven = openIssues - (betOneToSeven + pastOneDay);

    // updating state
    this.setState({
      searching: false,
      repo: `${url[3]}-${url[4]}`
        .replace(".", "-")
        .replace("#", "-")
        .replace("$", "-")
        .replace("[", "-")
        .replace("]", "-"),
      openIssues,
      pastOneDay,
      betOneToSeven,
      beforeSeven
    });
  };

  // to handle search after entering repo url
  handleSearch = e => {
    e.preventDefault();

    // if search input left empty
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

  // controlled form input value change handler
  handleChange = e => {
    this.setState({
      [e.target.name]: e.target.value
    });
  };

  // save the repo data on firebase
  save = () => {
    const {
      repo,
      openIssues,
      pastOneDay,
      betOneToSeven,
      beforeSeven,
      repository
    } = this.state;

    database
      .ref("data/" + repo)
      .set({
        repo,
        openIssues,
        pastOneDay,
        betOneToSeven,
        beforeSeven,
        repository
      })
      .then(() => {
        // console.log("Successfully written");
        this.setState({
          searching: false,
          repo: "",
          openIssues: "",
          pastOneDay: "",
          betOneToSeven: "",
          beforeSeven: "",
          repository: ""
        });
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
          this.state.searching ? (
            <p style={{ textAlign: "center" }}>loading...</p>
          ) : (
            ""
          )
        ) : (
          <div className="table">
            <table>
              <tbody>
                <tr>
                  <td>Repo</td>
                  <td>: {this.state.repo}</td>
                </tr>
                <tr>
                  <td>Total Open issues</td>
                  <td>: {this.state.openIssues}</td>
                </tr>
                <tr>
                  <td>No. of open issues opened in past 24 hrs</td>
                  <td>: {this.state.pastOneDay}</td>
                </tr>
                <tr>
                  <td>No. of open issues opened in past 1-7 days</td>
                  <td>: {this.state.betOneToSeven}</td>
                </tr>
                <tr>
                  <td>No. of open issues opened more than 7 days ago</td>
                  <td>: {this.state.beforeSeven}</td>
                </tr>
              </tbody>
            </table>
            <button onClick={this.save}>Save</button>
          </div>
        )}
        <Display />
      </div>
    );
  }
}

// Component to display saved data
class Display extends Component {
  state = {
    display: false,
    data: {}
  };

  // Toogle data display div
  showData = () => {
    this.setState({ display: !this.state.display });
  };

  // fetch saved data from firebase
  async componentDidMount() {
    const data = await database
      .ref("/data/")
      .once("value")
      .then(function(snapshot) {
        // console.log(snapshot.val());
        return snapshot.val();
      });
    this.setState({ data });
  }

  render() {
    let el = [];

    // mapping over fetched data
    if (this.state.data)
      el = Object.keys(this.state.data).map(m => {
        return (
          <tr key={this.state.data[m].repo}>
            <td className="repo">
              <a
                href={this.state.data[m].repository}
                target="_blank"
                rel="noopener noreferrer"
              >
                {this.state.data[m].repo}
              </a>
            </td>
            <td>{this.state.data[m].openIssues}</td>
            <td>{this.state.data[m].pastOneDay}</td>
            <td>{this.state.data[m].betOneToSeven}</td>
            <td>{this.state.data[m].beforeSeven}</td>
          </tr>
        );
      });

    return (
      <div className="display">
        <input
          type="button"
          value="Click to display saved data"
          onClick={this.showData}
        />
        {this.state.display ? (
          this.state.data ? (
            <div>
              <table>
                <thead>
                  <tr>
                    <th className="repo">Repo</th>
                    <th>Open Issues</th>
                    <th>&#60;= 1d</th>
                    <th>&#62; 1d &amp; &#60;= 7d</th>
                    <th>&#62; 7d</th>
                  </tr>
                </thead>
                <tbody>{el}</tbody>
              </table>
            </div>
          ) : (
            <p>No saved data</p>
          )
        ) : (
          ""
        )}
      </div>
    );
  }
}

export default App;
