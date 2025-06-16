import React, { useState, useRef, useEffect } from 'react';
import toast from 'react-hot-toast';
import ACTIONS from '../Actions';
import './EditorPage.css'
import Client from '../components/Client';
import Editor from '../components/Editor';
import { initSocket } from '../socket';
import {
    useLocation,
    useNavigate,
    Navigate,
    useParams,
} from 'react-router-dom';

const EditorPage = () => {
    const socketRef = useRef(null);
    const codeRef = useRef(null);
    const location = useLocation();
    const { roomId } = useParams();
    const reactNavigator = useNavigate();
    const [clients, setClients] = useState([]);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState('');

    const sendMessage = (e) => {
    e.preventDefault();
    if (message.trim() === '') return;
    socketRef.current.emit(ACTIONS.SEND_MSG, {
        roomId,
        username: location.state?.username,
        text: message,
    });
    setMessages((prev) => [...prev, {
        username: 'You',
        text: message,
    }]);
    setMessage('');
};


    useEffect(() => {
        const init = async () => {
            socketRef.current = await initSocket();
            socketRef.current.on('connect_error', (err) => handleErrors(err));
            socketRef.current.on('connect_failed', (err) => handleErrors(err));

            function handleErrors(e) {
                console.log('socket error', e);
                toast.error('Socket connection failed, try again later.');
                reactNavigator('/');
            }

            socketRef.current.emit(ACTIONS.JOIN, {
                roomId,
                username: location.state?.username,
            });

            // Listening for joined event
            socketRef.current.on(
                ACTIONS.JOINED,
                ({ clients, username, socketId }) => {
                    if (username !== location.state?.username) {
                        toast.success(`${username} joined the room.`);
                        console.log(`${username} joined`);
                    }
                    setClients(clients);
                    socketRef.current.emit(ACTIONS.SYNC_CODE, {
                        code: codeRef.current,
                        socketId,
                    });
                }
            );
            socketRef.current.on(ACTIONS.RECEIVE_MSG, ({ username, text }) => {
    setMessages((prev) => [...prev, { username, text }]);
});


            // Listening for disconnected
            socketRef.current.on(
                ACTIONS.DISCONNECTED,
                ({ socketId, username }) => {
                    toast.success(`${username} left the room.`);
                    setClients((prev) => {
                        return prev.filter(
                            (client) => client.socketId !== socketId
                        );
                    });
                }
            );
        };
        init();
        return () => {
            socketRef.current.disconnect();
            socketRef.current.off(ACTIONS.JOINED);
            socketRef.current.off(ACTIONS.DISCONNECTED);
        };
    }, []);

    async function copyRoomId() {
        try {
            await navigator.clipboard.writeText(roomId);
            toast.success('Room ID has been copied to your clipboard');
        } catch (err) {
            toast.error('Could not copy the Room ID');
            console.error(err);
        }
    }

    function leaveRoom() {
        reactNavigator('/');
    }

    if (!location.state) {
        return <Navigate to="/" />;
    }

    return (
        <div className="mainWrap">
    <div className="aside">
        <div className="asideInner">
            <div className="logo">
                {/* <img className="logoImage" src="/code-sync.png" alt="logo" /> */}
                <h2 className='heads'>CODE EDITOR</h2>
            </div>
            <h3>Members</h3>
            <div className="clientsList">
                {clients.map((client) => (
                    <Client key={client.socketId} username={client.username} />
                ))}
            </div>
        </div>
        <button className="btn copyBtn" onClick={copyRoomId}>Copy ROOM ID</button>
        <button className="btn leaveBtn" onClick={leaveRoom}>Leave</button>
    </div>

    <div className="mainEditorChatWrap">
        <div className="editorWrap">
            <Editor
                socketRef={socketRef}
                roomId={roomId}
                onCodeChange={(code) => {
                    codeRef.current = code;
                }}
            />
        </div>

        <div className="chatWrap">
            <div className="chatMessages">
                {messages.map((msg, i) => (
                    <div key={i}><strong>{msg.username}:</strong> {msg.text}</div>
                ))}
            </div>
            <form className="chatInputForm" onSubmit={sendMessage}>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type a message..."
                />
                <button type="submit">Send</button>
            </form>
        </div>
    </div>
</div>

    );
};

export default EditorPage;
