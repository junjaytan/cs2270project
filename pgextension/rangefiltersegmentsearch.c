#include "postgres.h"
#include "fmgr.h"
#include "utils/builtins.h"
#include "utils/timestamp.h"

PG_MODULE_MAGIC;

PG_FUNCTION_INFO_V1(segment_range);
Datum
segment_range(PG_FUNCTION_ARGS)
{
    Timestamp ts = PG_GETARG_TIMESTAMP(0);
    PG_RETURN_TIMESTAMP(ts);
}