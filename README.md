# Installation
After cloning the repository, please `yarn` to install dependencies.
# Run development server
Run  `ng serve`

# Design choices
* I prefer to make extensive use of RXJS in conjunction with the `OnPush` change detection strategy to reduce the number of unnecessary render cycles.
* I prefer to minimize the number of `ElementRef`s to keep the coupling between Typescript and HTML as loose as possible.
* I have made use of the Octokit Typescript library and ChartJS.
* I have made use of a debounce on the search input to prevent unnecessary requests to the Github API.