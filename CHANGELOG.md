# Change log
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](http://keepachangelog.com/)
and this project adheres to [Semantic Versioning](http://semver.org/).

## [[*next-version*]] - YYYY-MM-DD
### Fixed
- Wrong output for admin textarea titles.

### Changed
- Extracted address field serialization.
- Address will now be parsed on change (keyup), with a de-bounce delay of 1 second.

### Added
- Notification will pop up for 3 seconds every time an address is successfully parsed.
- An address field can now have a custom placeholder set.

## [0.1-alpha1] - 2018-10-13
Initial version.
