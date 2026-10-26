"use client";
import {useEffect} from 'react';

/** Keep keyboard navigation inside the topmost modal without changing game keys. */
export function DialogKeyboard(){
 useEffect(()=>{
  const handle=(event:KeyboardEvent)=>{
   if(event.key!=='Tab')return;
   const dialogs=Array.from(document.querySelectorAll<HTMLElement>('[role="dialog"][aria-modal="true"]'));
   const dialog=dialogs.at(-1);if(!dialog)return;
   const items=Array.from(dialog.querySelectorAll<HTMLElement>('button:not(:disabled),input:not(:disabled),select:not(:disabled),a[href],[tabindex="0"]')).filter(el=>el.getClientRects().length);
   if(!items.length)return;
   const first=items[0],last=items.at(-1)!;
   if(!dialog.contains(document.activeElement)){event.preventDefault();first.focus();return;}
   if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
   else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  };
  document.addEventListener('keydown',handle);return()=>document.removeEventListener('keydown',handle);
 },[]);
 return null;
}
