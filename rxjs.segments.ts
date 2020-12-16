  /**
  * Get paged data, combine and emit once
  */
  public getData(keyword: string, index: number = 0, limit: number = 50): Observable<any[]> {
    const first = this.getDataPaged(keyword, index, limit);
    return first.pipe(mergeMap(lastData => {
      if (lastData.length < limit) {
        return observableOf(lastData);
      } else {
        index += lastData.length;
        // combine arrays and emit the last combined value
        return forkJoin([observableOf(lastData), this.getData(keyword, index, limit)])
          .pipe(map(([val1, val2]) => val1.concat(val2)));
      }
    })
    );
  }
