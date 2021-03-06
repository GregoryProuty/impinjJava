#!/usr/bin/env node
const childClass = require('child_process');
const program = require('commander');
const readline = require('readline').emitKeypressEvents(process.stdin);
const chalk = require('chalk');

program
  .version('0.0.1')
  .description('Inpinja Setter');

program
	.command('start <ip> <ReportMode> <ReaderMode>')
	.alias('s')
	.description('Start reader')
	.action((ip, ReportMode, ReaderMode) => {
		console.log('\nStarting child process\n')
		console.log('  >> java -jar Octane.jar ' + ip + ' ' + ReportMode + ' ' + ReaderMode + '\n')

		let child = spawnChild(ip, ReportMode, ReaderMode);
		listenStdout(child)
		processWatcher(child, ip, ReportMode, ReaderMode)
	});

program.parse(process.argv);

//create node child process and start the jar inside
function spawnChild(ip, ReportMode, ReaderMode) {
	return childClass.spawn(
	  	'java', ['-jar', 'Octane.jar', ip, ReportMode, ReaderMode]
	)
}

//on java stdout event, log 
function listenStdout(childInstance) {
	childInstance.stdout.on('data', function (data) {
		data = data.toString();
		if(data !== undefined && data.length > 1) {
			console.log('	stdout: ' + chalk.yellow(stdoutStringFormat(data)))
		}
	});

	childInstance.stderr.on('data', function (data) {
	    console.log(chalk.red('	stderr: ' + data))
	});
} 

//prevent tags being bunched on to one line in the console output, 
//injects \n char every 29 characters if str length is longer than 29
function stdoutStringFormat(str) {
	if(str.length > 29) {
		for(var i = 1;i < Math.floor(str.length / 29);i++) {
			str = str.split('').splice(i*29, 0, '\n').join('');
		}
	} 
	return str
}

function processWatcher(child, ip_address, Report_Mode, Reader_Mode) {
	//sends user input to jar's stdin, currently set to stop on any input
	process.stdin.pipe(child.stdin)

	//node keypress scanner, any input will be sent to jar first then close node process
	process.stdin.setRawMode(true)
	process.stdin.on('keypress', (str, key) => {
		console.log('\nStopping ' + ip_address + '...\nDisconnecting from ' + ip_address
		+ '...\nClosing jar...\nTerminating node process...\n\nDone. To restart run:\n' 
		+ '  node command.js start ' + ip_address + ' ' + Report_Mode + ' ' + Reader_Mode)
	    process.exit()
	});
}

if(process.argv.length <= 2) {
	console.log('\n  Impinja Setter\n\n  Commands:\n      start <ip> <ReportMode> <ReaderMode>\n  Ex:\n      node command.js start 192.168.1.127 Individual AutoSetDenseReader\n')
}