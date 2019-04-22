# PG Extension for Filter Segment Search

To compile, install, and use this extension, do the following:

* Compile binaries: `make`
* Install binaries to postgres library folder: `make install`
* The shared library should now be available in postgres. Now you can log into postgres and create the extension: `CREATE EXTENSION rangefiltersegmentsearch;`
* You can now use the function(s) provided in the extension.

To uninstall the extension:

* Drop the extension in your postgres db: `DROP EXTENSION rangefiltersegmentsearch;`
* Uninstall it from your pg shared library folder: `make uninstall`
* Clean up compiled files: `make clean`