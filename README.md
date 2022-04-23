# Prerequisites
Please install 
* Node 
* Angular cli
* Yarn
# Installation
After cloning the repository, navigate into the project, and enter `yarn` to install dependencies.

# Set Github Access Token
* Go to https://github.com/settings/tokens, click 'Generate new token', enter a 'note', and click the 'generate new token' button (Note: no additional scopes need to be added)
* Go to `src/environments/environment.ts` and paste the token under the `githubAccessToken` key.
Note: usually the access token would be secured server-side and would only be exposed to authenticated users.
This is beyond the scope of this assignment.
# Run development server
Run  `ng serve`

# Design choices
* I prefer to make extensive use of RXJS in conjunction with the `OnPush` change detection strategy to reduce the number of unnecessary render cycles.
* I prefer to minimize the number of `ElementRef`s to keep the coupling between Typescript and HTML as loose as possible.
* I have made use of the Octokit Typescript library and ChartJS.
* I have made use of a debounce on the search input to prevent unnecessary requests to the Github API.