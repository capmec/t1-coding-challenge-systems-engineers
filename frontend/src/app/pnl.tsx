'use client';

import { useStream } from '@/hooks/useStream';
import { useState, useEffect } from 'react';

interface PnL {
	startTime: string;
	endTime: string;
	pnl: number;
}

interface TableProps {
	pnls: Array<PnL>;
	lastUpdated: Date;
}

const Table = ({ pnls, lastUpdated }: TableProps) => (
	<div className='border rounded-lg p-4 max-w-4xl w-full min-w-[350px] mx-auto'>
		<div className='flex justify-between items-center mb-4'>
			<h3 className='text-lg font-semibold'>Recent P&L Results</h3>
		</div>

		<div className='max-h-96 overflow-y-auto scrollbar-purple'>
			<table className='table-fixed w-full'>
				<thead className='sticky top-0 z-10 bg-white/0.05 backdrop-blur p-4 text-white transition-colors'>
					<tr className='border-b'>
						<th className='text-left p-2 w-1/3'>Start Time</th>
						<th className='text-left p-2 w-1/3'>End Time</th>
						<th className='text-right p-2 w-1/3'>P&L</th>
					</tr>
				</thead>
				<tbody>
					{pnls.map((pnl, index) => (
						<tr key={`${pnl.startTime}-${index}`}>
							<td className='p-2 text-sm'>
								{new Date(pnl.startTime).toLocaleTimeString()}
							</td>
							<td className='p-2 text-sm'>
								{new Date(pnl.endTime).toLocaleTimeString()}
							</td>
							<td
								className={`p-2 text-right font-bold ${
									pnl.pnl >= 0 ? 'text-green-600' : 'text-red-600'
								}`}>
								{pnl.pnl >= 0 ? '+' : ''}
								{pnl.pnl.toFixed(2)}
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</div>

		<div className='mt-4 text-sm text-gray-500 text-center'>
			Showing latest {pnls.length} results
		</div>
		<div className='text-sm text-gray-500 text-center mt-1'>
			Last updated: {lastUpdated.toLocaleTimeString()}
			<span className='ml-2 inline-block w-2 h-2 bg-green-500 rounded-full animate-pulse'></span>
		</div>
	</div>
);

const PnLs = () => {
	const pnls = useStream<Array<PnL>>('/pnl');
	const [lastUpdated, setLastUpdated] = useState(new Date());
	const [previousLength, setPreviousLength] = useState(0);

	// Update timestamp when new data arrives
	useEffect(() => {
		if (pnls && pnls.length > previousLength) {
			setLastUpdated(new Date());
			setPreviousLength(pnls.length);
		}
	}, [pnls, previousLength]);

	// Debug logging
	useEffect(() => {
		console.log('PnL data updated:', {
			dataLength: pnls?.length,
			lastUpdated: lastUpdated.toLocaleTimeString(),
			isArray: Array.isArray(pnls),
		});
	}, [pnls, lastUpdated]);

	// Show all PnL entries, newest last (no slice/reverse)
	const allPnls = pnls && pnls.length > 0 ? pnls : [];

	return (
		<div className='space-y-4 max-w-4xl w-full min-w-[700px] mx-auto'>
			{allPnls.length > 0 ? (
				<Table
					pnls={allPnls}
					lastUpdated={lastUpdated}
				/>
			) : (
				<div className='border rounded-lg p-8 text-center bg-gray-50'>
					<div className='animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4'></div>
					<p className='text-gray-600'>Loading P&L data...</p>
					<p className='text-sm text-gray-500 mt-2'>
						Waiting for real-time updates from the calculation service
					</p>
				</div>
			)}
		</div>
	);
};

export default PnLs;
