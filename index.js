(async function() {
  const fs = require('fs')
  const split = require('split')
  const stream = require('stream')
  const si = require('search-index')
  const memdown = require('memdown')

  const { PUT, QUERY } = await si({
    db: memdown('journals')
  });

  function readFile(file) {
    return new Promise((resolve, reject) => {
      let readStream = fs.createReadStream('journals/' + file).pipe(split(JSON.parse, null, { trailing: false }));

      const promises = [];
      readStream.on('data', (entry) => {
        promises.push(PUT([ entry ]));
      });

      readStream.on('end', () => {
        Promise.all(promises)
          .then(() => resolve());
      });

      readStream.on('error', (err) => {
        reject(err)
      });
    });
  }

  const promises = fs.readdirSync('journals').map(file => readFile(file));

  await Promise.all(promises);

  const results = await QUERY(
    { SEARCH: [ 'Chaudron' ] },
    { DOCUMENTS: true, PAGE: { NUMBER: 0, SIZE: 20 } }
  );

  console.log(JSON.stringify(results));
  
}())
