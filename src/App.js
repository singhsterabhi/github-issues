import React, { Component } from "react";
import moment from "moment";

class App extends Component {
  state = {
    repo: "",
    openIssues: ""
  };
  async componentDidMount() {
    const url = "https://github.com/ncs-jss/HTTP_200";
    const urlp = url.split("/");
    console.log(urlp);
    let day = new Date(2016, 5, 17);
    let dayWrapper = moment(day).toISOString();
    console.log(dayWrapper);

    // const reqUrl = `https://api.github.com/repos/${urlp[3]}/${
    //   urlp[4]
    // }/issues?since=${dayWrapper}`;

    // const reqUrl = `https://api.github.com/repos/${urlp[3]}/${urlp[4]}`;

    const reqUrl = `https://api.github.com/search/issues?q=repo:${urlp[3]}/${
      urlp[4]
    }+type:issue+state:open+created_at>=${dayWrapper}`;

    console.log(reqUrl);
    const data = await fetch(reqUrl).then(d => d.json());
    console.log(data);
    console.log(data["open_issues_count"]);
    this.setState({
      repo: data["full_name"],
      openIssues: data["open_issues_count"]
    });
  }
  render() {
    return (
      <>
        <p>hello</p>
        <p>Repo : {this.state.repo}</p>
        <p>open_issues_count : {this.state.openIssues}</p>
      </>
    );
  }
}

export default App;
