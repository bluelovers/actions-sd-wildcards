# bundle Stable Diffusion wildcards

[![GitHub Super-Linter](https://github.com/actions/typescript-action/actions/workflows/linter.yml/badge.svg)](https://github.com/super-linter/super-linter)
![CI](https://github.com/actions/typescript-action/actions/workflows/ci.yml/badge.svg)
[![Check dist/](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/check-dist.yml)
[![CodeQL](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml/badge.svg)](https://github.com/actions/typescript-action/actions/workflows/codeql-analysis.yml)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)

```yaml
name: bundle Stable Diffusion wildcards

on:
   workflow_dispatch:
   push:
      branches:
         - main
      paths:
         - '**/*.yaml'
         - '**/*.yml'
#  schedule:
## https://help.github.com/en/actions/automating-your-workflow-with-github-actions/events-that-trigger-workflows#scheduled-events-schedule
##            ┌───────────── minute (0 - 59)
##            │ ┌───────────── hour (0 - 23)
##            │ │ ┌───────────── day of the month (1 - 31)
##            │ │ │ ┌───────────── month (1 - 12 or JAN-DEC)
##            │ │ │ │ ┌───────────── day of the week (0 - 6 or SUN-SAT)
##            │ │ │ │ │
##            │ │ │ │ │
##            │ │ │ │ │
##            * * * * *
#    - cron: '* * 1 * *'
#    - cron: '* * 15 * *'

permissions:
   contents: write

jobs:
   main-action:
      runs-on: ubuntu-latest
      if: "!contains(github.event.head_commit.message, '[skip ci]')"

      steps:
         -
            uses: actions/checkout@main
            with:
               fetch-depth: 2
               token: ${{ secrets.GITHUB_TOKEN }}
         -
            name: echo var
            run: |
               echo ${GITHUB_SHA}
         -
            name: setup git config
            run: |
               git config --local user.email "action@github.com"
               git config --local user.name "GitHub Action"
         -
            name: bundle Stable Diffusion wildcards
            uses: bluelovers/actions-sd-wildcards@v1.0.3
            with:
               paths: |
                  costumes/*.yaml
                  other/corn-flakes-model.yaml
               outputFile: bundle/corn-flakes-aio-bundle.yaml
               allowMultiRoot: 1
               autoCreateOutputDir: 1
               disableUnsafeQuote: 1
         -
            name: bundle Stable Diffusion wildcards
            uses: bluelovers/actions-sd-wildcards@v1.0.3
            with:
               paths: |
                  costumes/*.yaml
                  other/corn-flakes-model.yaml
                  other/corn-flakes-sex-positions.yaml
               outputFile: bundle/corn-flakes-aio-bundle-sex.yaml
               allowMultiRoot: 1
               autoCreateOutputDir: 1
               disableUnsafeQuote: 1
         -
            name: git commit
            run: |
               git add ./bundle
               git commit -m "build: bundle wildcards" & echo commit
         -
            name: Push changes
            if: success()
            uses: ad-m/github-push-action@master
            with:
               github_token: ${{ secrets.GITHUB_TOKEN }}

```
