import React, { useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: 'dracula',
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    return <textarea id="realtimeEditor"></textarea>;
};

export default Editor;

// import React, { useEffect, useRef, useState } from 'react';
// import Codemirror from 'codemirror';
// import 'codemirror/lib/codemirror.css';
// import 'codemirror/theme/dracula.css';
// import 'codemirror/mode/javascript/javascript';
// import 'codemirror/addon/edit/closetag';
// import 'codemirror/addon/edit/closebrackets';
// import ACTIONS from '../Actions';
// import './Editor.css'; // You’ll create this CSS

// const Editor = ({ socketRef, roomId, onCodeChange }) => {
//     const editorRef = useRef(null);
//     const [messages, setMessages] = useState([]);
//     const [msg, setMsg] = useState('');

//     // Initialize CodeMirror
//     useEffect(() => {
//         async function init() {
//             editorRef.current = Codemirror.fromTextArea(
//                 document.getElementById('realtimeEditor'),
//                 {
//                     mode: { name: 'javascript', json: true },
//                     theme: 'dracula',
//                     autoCloseTags: true,
//                     autoCloseBrackets: true,
//                     lineNumbers: true,
//                 }
//             );

//             editorRef.current.on('change', (instance, changes) => {
//                 const { origin } = changes;
//                 const code = instance.getValue();
//                 onCodeChange(code);
//                 if (origin !== 'setValue') {
//                     socketRef.current.emit(ACTIONS.CODE_CHANGE, {
//                         roomId,
//                         code,
//                     });
//                 }
//             });
//         }
//         init();
//     }, []);

//     // Code sync listener
//     useEffect(() => {
//         if (socketRef.current) {
//             socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
//                 if (code !== null) {
//                     editorRef.current.setValue(code);
//                 }
//             });

//             // Listen for chat messages
//             socketRef.current.on(ACTIONS.CHAT_MESSAGE, ({ message }) => {
//                 setMessages(prev => [...prev, message]);
//             });
//         }

//         return () => {
//             socketRef.current.off(ACTIONS.CODE_CHANGE);
//             socketRef.current.off(ACTIONS.CHAT_MESSAGE);
//         };
//     }, [socketRef.current]);

//     const sendMessage = () => {
//         if (msg.trim()) {
//             socketRef.current.emit(ACTIONS.CHAT_MESSAGE, {
//                 roomId,
//                 message: msg,
//             });
//             setMessages(prev => [...prev, msg]);
//             setMsg('');
//         }
//     };

//     return (
//         <div className="editor-wrapper">
//             <div className="code-editor">
//                 <textarea id="realtimeEditor"></textarea>
//             </div>
//             <div className="chat-box">
//                 <div className="chat-messages">
//                     {messages.map((m, i) => (
//                         <div key={i} className="chat-message">{m}</div>
//                     ))}
//                 </div>
//                 <div className="chat-input">
//                     <input
//                         type="text"
//                         placeholder="Type a message..."
//                         value={msg}
//                         onChange={(e) => setMsg(e.target.value)}
//                         onKeyDown={(e) => {
//                             if (e.key === 'Enter') sendMessage();
//                         }}
//                     />
//                     <button onClick={sendMessage}>Send</button>
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default Editor;
