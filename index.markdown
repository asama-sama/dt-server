---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: index
---

# About

## Tech Stack

**Data Management Engine**
* node.js
* express
* docker

**Analysis Enginge**
* python
* flask

**Database**
* postgres
* postGIS

**Viewer**
* react
* leaflet
* turf.js

# Server

## Datasources

The application is able to parse data from several different sources. See the table below for a summary of the currently supported sources.

| Name | Type | Reference |
| --- | ------- | ------- |
| Air Quality | API | [dpie.nsw.gov.au](https://www.dpie.nsw.gov.au) |
| Traffic volume | API | [transport.nsw.gov.au](https://roads-waterways.transport.nsw.gov.au/) |
| Traffic incidents | API | [opendata.transport.nsw.gov.au](https://opendata.transport.nsw.gov.au/) |
| Weather | API | [bom.gov.au](http://www.bom.gov.au/) |
| Greenhouse gas emissions | CSV | [data.cityofsydney.nsw.gov.au](https://data.cityofsydney.nsw.gov.au/) |
| Crime | CSV | [bocsar.nsw.gov.au](https://www.bocsar.nsw.gov.au/) |
 

## Architecture

![image]({{ site.url }}/assets/architecture.jpg)

## Data Management Engine

The Data Management Engine is responsible for retrieving the data from the given sources and updating it to the database. It is also responsible for fetching data for analysis and visualisation purposes.

*Language*: Typescript

*Framework*: Express

## Analysis Engine

The Analysis Engine parses data using a number of available techniques to gain insights.

Currently supported techniques include:
* Simple Correlation - This method takes two data sources and compares them, returning a value representing their correlation and a score, to identify of how much significance this result is.

*Language*: Python

*Framework*: Flask

# Viewer

This frontend combines the result from the Data Management Engine and the Analysis Engine and allows a user to select data sources of interest, and view results for them.

## Comparison View

This view allows a user to compare 2 data sources and view the results for them for a spatial area and time period, and finds correlations for subtypes of the data for the same selection.



## Single Source View