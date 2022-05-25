const fs = require('fs').promises;

async function save(dir, data, name) 
{
	const filename =  dir + name + ".json"; 
    await fs.writeFile(filename, JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v), function (err) {
		   if (err) return console.log(err);
		 });

};

async function read(dir, name) 
{
	const filename =  dir + name + ".json"; 
    const data = await fs.readFile(filename, 'utf8', function (err) {
		   if (err) return console.log(err);
		 });
	const jsonData = JSON.parse(data);
	return jsonData;
};


module.exports = {
	save,
	read
}