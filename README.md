# Pointr Package Base

This is a base package for Pointr to make it easier to create new packages and publish them to the Pointr (Github) registry.

## How to use

### Starting package from local

- Create a new directory and copy the contents of this repository into it. 

### Starting from Github

- Create a new repository and use this repository as a template.

- Make sure to have `POINTR_PKG_TOKEN` in your environment variables. The value to this token is available on the [Pointr 1Password](https://pointr.1password.com/) website under the `Local Development` vault.

- Replace these values in `package.json` :
  - name
  - description
  - author
  - repository -> url
  - bugs -> url
  - homepage
  - keywords