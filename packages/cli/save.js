const fs = require('fs').promises;
const BSON = require('bson');
const bigintConversion = require('bigint-conversion');

function normalize(data)
{	
	for(var key in data)
	{
		const value = data[key];
		//console.log("key ", key, value.length);
		let i;
		for( i = 0; i < value.length; i++ )
		{
			data[key][i] = new BSON.Long(bigintConversion.bufToBigint(data[key][i]));
		}
	}
	return data;
}

function normalizeBack(data)
{	
	for(var key in data)
	{
		const value = data[key];
		//console.log("key ", key, value.length);
		let i;
		for( i = 0; i<value.length; i++ )
		{
			const negative = (value[i] < 0)? true: false;
			if( negative)
				data[key][i] = bigintConversion.bigintToBuf(-value[i], true);
			else
				data[key][i] = Uint8Array.from(bigintConversion.bigintToBuf(value[i], true));
		}	
	}
	return data;
}


async function save(dir, data, name, binary = false) 
{
	const filename =  dir + name + ".json"; 
	/*
	if( binary )
	{
		for(var key in data)
		{
			const value = data[key];
			console.log("key ", key, value);
			if( typeof(value) === 'bigint') { data[key] = new BSON.Long(value); console.log("Converting bigint key ", key, value); };
			if( typeof(key) === 'bigint') console.error("key is bigint", key); 
		}

	}
	*/
	const writeData = binary? BSON.serialize(normalize(data)) : 
							  JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v);
    await fs.writeFile(filename, writeData, function (err) {
		   if (err) return console.log(err);
		 });

};

async function read(dir, name, binary = false) 
{
	const filename =  dir + name + ".json"; 
    const data = await fs.readFile(filename, binary? null : 'utf8', function (err) {
		   if (err) return console.log(err);
		 });
	const jsonData = binary? normalizeBack( BSON.deserialize(data) ) : JSON.parse(data);
	return jsonData;
};



module.exports = {
	save,
	read
}