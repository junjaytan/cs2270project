EXTENSION = rangefiltersegmentsearch
DATA = sql/rangefiltersegmentsearch--0.0.1.sql
TESTS = $(wildcard tests/sql/*.sql)

# find the sql and expected directories under test
# load base36 extension into test db
# load plpgsql into test db
REGRESS_OPTS  = --inputdir=tests         \
                --load-extension=rangefiltersegmentsearch \
                --load-language=plpgsql
REGRESS       = $(patsubst tests/sql/%.sql,%,$(TESTS))
MODULES = $(patsubst %.c,%,$(wildcard src/*.c)) # c modules to build

# postgres build stuff
PG_CONFIG = pg_config
PGXS := $(shell $(PG_CONFIG) --pgxs)
include $(PGXS)