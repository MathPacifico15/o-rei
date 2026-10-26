import React from 'react';
import {createRoot} from 'react-dom/client';
import Home from '../app/page';
import {DialogKeyboard} from '../components/dialog-keyboard';
import '../app/globals.css';
import '../app/career-polish.css';
createRoot(document.getElementById('root')!).render(<><DialogKeyboard/><Home/></>);
