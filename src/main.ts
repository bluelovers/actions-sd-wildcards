import { notice, getInput, setFailed, setOutput, InputOptions } from '@actions/core'
import { stream } from 'fast-glob'
import { dirname, extname, resolve } from 'path'
import {
	_mergeWildcardsYAMLDocumentRootsCore,
	IWildcardsYAMLDocument,
	parseWildcardsYaml,
	stringifyWildcardsYamlData,
} from 'sd-wildcards-utils';
import { mkdir, readFile, writeFile } from 'fs/promises';
import { envBool } from 'env-bool';

function isAllowedExt(ext: string, loose?: boolean): ext is '.yaml' | '.yml'
{
	return ext === '.yaml' || loose && ext === '.yml'
}

function getInputEnvBool(name: string, options?: InputOptions)
{
	return envBool(getInput(name, options)) as boolean
}

/**
 * The main function for the action.
 * @returns {Promise<void>} Resolves when the action is complete.
 */
export async function run(): Promise<void>
{
	try
	{
		const bundle = !getInputEnvBool('disableBundle');

		let outputFile: string = getInput('outputFile')

		notice(`outputFile: ${outputFile}`)

		if (bundle && !isAllowedExt(extname(outputFile)))
		{
			throw new RangeError(`The extname of outputFile only allow .yaml`)
		}

		outputFile = resolve(outputFile);

		let paths: string | string[] = getInput('paths')

		paths = paths?.split(/[\r\n]/).reduce((a, v) =>
		{

			v = v.trim();
			if (v.length)
			{
				a.push(v)
			}

			return a
		}, [] as string[]);

		notice(`paths: ${paths}`)

		if (!paths?.length)
		{
			throw new RangeError(`The paths should not be empty`)
		}

		let doc: IWildcardsYAMLDocument;

		const allowMultiRoot = getInputEnvBool('allowMultiRoot');
		const disableUnsafeQuote = getInputEnvBool('disableUnsafeQuote');
		const minifyPrompts = getInputEnvBool('minifyPrompts');

		for await (const file of stream(paths, {
			absolute: true,
			onlyFiles: true,
			throwErrorOnBrokenSymbolicLink: true,
			unique: true,
		}) as any as string[])
		{
			notice(`processing ${file}`);

			if (!isAllowedExt(extname(file), true))
			{
				throw new RangeError(`The extname of file only allow .yaml or .yml`)
			}

			const current = parseWildcardsYaml(await readFile(file), {
				allowMultiRoot,
				disableUnsafeQuote,
				minifyPrompts,
			});

			if (bundle && doc)
			{
				_mergeWildcardsYAMLDocumentRootsCore(doc, current);
			}

			doc ??= current;
		}

		if (bundle)
		{
			if (getInputEnvBool('autoCreateOutputDir'))
			{
				await mkdir(dirname(outputFile), {
					recursive: true,
				})
			}

			await writeFile(outputFile, stringifyWildcardsYamlData(doc, {
				lineWidth: 0,
			}))

			notice(`output: ${outputFile}`)
		}

		// Set outputs for other workflow steps to use
		setOutput('time', new Date().toTimeString())
	}
	catch (error)
	{
		// Fail the workflow run if an error occurs
		if (error instanceof Error) setFailed(error.message)
	}
}
