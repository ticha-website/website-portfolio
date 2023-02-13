Website Portfolio
--------

[![Codeac](https://static.codeac.io/badges/2-301952939.svg "Codeac")](https://app.codeac.io/github/ticha-website/website-portfolio)

Portfolio for designers work

## Technologies

<<<<<<< HEAD
The project is based on Bootstrap 4.5.2. and leverage the SASS. 
=======
The project is based on Bootstrap 5.2.3 and leverage the SASS.
>>>>>>> da99e28 (/ upgrade of bootstrap)
We used nunjucks for templating the html sites.

The site is running on AWS. The whole deployment is automated by CI/CD pipeline in GitHub Actions.

## Requirements
 - NodeJS 16.x


## Installation & Run

```
#!bash

docker-compose -f docker-compose.yml -f docker-compose.dev.yml up
```


## Design Style Guide

For proper component development read and actively use the Style Guide.
You can find it under [/docs/](http://localhost:8000/docs/) URL locally and even on staging and prod.
