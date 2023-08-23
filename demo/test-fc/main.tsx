import { useState } from 'react';
import ReactDOM from 'react-dom/client';

const App = () => {
	const [num, setNum] = useState(101);
	// const arr =
	// 	num % 2 === 0
	// 		? [<li key="1">1</li>, <li key="2">2</li>, <li key="3">3</li>]
	// 		: [<li key="3">3</li>, <li key="2">2</li>, <li key="1">1</li>];
	return (
		<ul>
			<>
				<li>1</li>
				<li>2</li>
			</>
			<li>3</li>
			<li>4</li>
		</ul>
	);
	// return <ul onClick={() => setNum(num + 1)}>{arr}</ul>;
};

ReactDOM.createRoot(document.getElementById('root')!).render(<App />);
