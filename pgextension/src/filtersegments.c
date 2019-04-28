#include "postgres.h"
#include "fmgr.h"
#include "funcapi.h"
#include "utils/builtins.h"
#include "utils/timestamp.h"

PG_MODULE_MAGIC;

PG_FUNCTION_INFO_V1(filter_segments_beta);
Datum
filter_segments_beta(PG_FUNCTION_ARGS)
{
  // can convert text to string: char * start = text2cstring( PG_GETARG_TEXT_P(0));


  FuncCallContext * srf;
  MemoryContext oldcontext;

  if( SRF_IS_FIRSTCALL()) {
    srf = SRF_FIRSTCALL_INIT();
    oldcontext = MemoryContextSwitchTo( srf->multi_call_memory_ctx );

    MemoryContextSwitchTo( oldcontext );
  }

  srf = SRF_PERCALL_SETUP();

  if( srf->call_cntr < srf->max_calls ) {
    HeapTuple tuple;
  }


  /*
  FuncCallContext *funcctx;
  TupleDesc tupdesc;
  AttInMetadata *attinmeta;

  //text tblname = PG_GETARG_TEXT_P(0);
  if (SRF_IS_FIRSTCALL ()) {
    MemoryContext oldcontext;
    funcctx = SRF_FIRSTCALL_INIT ();
    oldcontext = MemoryContextSwitchTo(funcctx->multi_call_memory_ctx);

    tupdesc = RelationNameGetTupleDesc("sinewaves_data");
    tupdesc = BlessTupleDesc(tupdesc);  // for datums
    //attinmeta = TupleDescGetAttInMetadata (tupdesc);
    //funcctx -> attinmeta = attinmeta;

    MemoryContextSwitchTo(oldcontext);
  }

  funcctx = SRF_PERCALL_SETUP();

  if (funcctx->call_cntr < funcctx->max_calls) {
    char **values;
    Datum result;
    HeapTuple tuple;
    //result = TupleGetDatum(funcctx -> slot, tuple);

    //values = (char **) palloc (2 * sizeof (char *));
    //values [0] = (char*) palloc (16 * sizeof (char));
    //values [1] = (char*) palloc (16 * sizeof (char));

    //snprintf(values[0], 16, "%d", 1 * PG_GETARG_INT32(1));
    //snprintf(values[1], 16, "%d", 2 * PG_GETARG_INT32(1));
    //snprintf(values[2], 16, "%d", 3 * PG_GETARG_INT32(1));

    //tuple = BuildTupleFromCStrings (funcctx -> attinmeta, values);
    //result = HeapTupleGetDatum(tuple);

    SRF_RETURN_NEXT(funcctx, result);
  } else {
    SRF_RETURN_DONE(funcctx);
  }

  //char* tblnamechar = (char*)tblname;
  //char* tblname = PG_GETARG_CSTRING(0);
  //PG_RETURN_TIMESTAMP(ts);
  */
}