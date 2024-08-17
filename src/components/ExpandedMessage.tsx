import React, { useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Message, Comment } from '../types';

const MessageContent = styled(motion.p)`
  font-family: 'Permanent Marker', cursive;
  font-size: 1.2rem;
  line-height: 1.6;
  color: ${props => props.theme.colors.text};
  background-color: ${props => props.theme.colors.background}80;
  padding: 1rem;
  border-radius: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 1rem;
  text-align: center;
`;

const Overlay = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ExpandedMessageContainer = styled(motion.div)`
  background-color: ${props => props.theme.colors.background};
  padding: 2rem;
  border-radius: 10px;
  max-width: 80%;
  max-height: 80%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;

  @media (max-width: ${props => props.theme.breakpoints.mobile}) {
    padding: 1.5rem;
    max-width: 90%;
    max-height: 90%;
  }
`;

const ExpandedImage = styled(motion.img)`
  width: 100%;
  max-height: 60vh;
  object-fit: contain;
  margin-bottom: 1rem;
`;

const CloseButton = styled(motion.button)`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
`;

const AudioPlayer = styled(motion.audio)`
  width: 100%;
  margin-top: 1rem;
`;

const ReactionContainer = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ReactionButton = styled(motion.button)`
  background: none;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 20px;
  padding: 0.5rem 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const CommentSection = styled(motion.div)`
  margin-top: 2rem;
`;

const CommentInput = styled(motion.textarea)`
  width: 100%;
  padding: 0.5rem;
  border: 1px solid ${props => props.theme.colors.primary};
  border-radius: 5px;
  resize: vertical;
  margin-bottom: 0.5rem;
`;

const CharacterCount = styled(motion.div)`
  font-size: 0.8rem;
  color: ${props => props.theme.colors.secondary};
  text-align: right;
  margin-bottom: 0.5rem;
`;

const CommentList = styled(motion.ul)`
  list-style-type: none;
  padding: 0;
`;

const CommentItem = styled(motion.li)`
  background-color: ${props => props.theme.colors.secondary}20;
  padding: 1rem;
  border-radius: 5px;
  margin-bottom: 1rem;
`;

const CommentCount = styled(motion.span)`
  font-size: 0.9rem;
  color: ${props => props.theme.colors.secondary};
  margin-left: 0.5rem;
`;

interface ExpandedMessageProps extends Message {
  onClose: () => void;
  onUpdateMessage: (updatedMessage: Message) => void;
}

const ExpandedMessage: React.FC<ExpandedMessageProps> = ({ 
  id, 
  content, 
  image, 
  audio, 
  reactions, 
  comments, 
  initialX, 
  initialY, 
  color, 
  onClose, 
  onUpdateMessage 
}) => {
  const [newComment, setNewComment] = useState('');
  const [updatingReaction, setUpdatingReaction] = useState<string | null>(null);
  const [localReactions, setLocalReactions] = useState(reactions);
  const [localComments, setLocalComments] = useState(comments);

  const handleReaction = async (emoji: string) => {
    setUpdatingReaction(emoji);
    const updatedReactions = { ...localReactions };
    updatedReactions[emoji] = (updatedReactions[emoji] || 0) + 1;
    setLocalReactions(updatedReactions);
    const updatedMessage: Message = {
      id, content, image, audio, initialX, initialY, color,
      reactions: updatedReactions,
      comments: localComments,
    };
    await onUpdateMessage(updatedMessage);
    setUpdatingReaction(null);
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        content: newComment.trim(),
        timestamp: Date.now(),
      };
      const updatedComments = [...localComments, newCommentObj];
      setLocalComments(updatedComments);
      const updatedMessage: Message = {
        id, content, image, audio, reactions: localReactions, initialX, initialY, color,
        comments: updatedComments,
      };
      onUpdateMessage(updatedMessage);
      setNewComment('');
    }
  };

  return (
    <AnimatePresence>
      <Overlay
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <ExpandedMessageContainer
          initial={{ scale: 0.8, opacity: 0, y: 50 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.8, opacity: 0, y: 50 }}
          transition={{ type: "spring", damping: 15, stiffness: 100 }}
          onClick={(e) => e.stopPropagation()}
        >
          <CloseButton
            onClick={onClose}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
          >
            &times;
          </CloseButton>
          {image && (
            <ExpandedImage
              src={typeof image === 'string' ? image : URL.createObjectURL(image)}
              alt="Expanded Message"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            />
          )}
          <MessageContent
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            {content}
          </MessageContent>
          {audio && (
            <AudioPlayer
              controls
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
            >
              <source src={typeof audio === 'string' ? audio : URL.createObjectURL(audio)} type="audio/mpeg" />
              Your browser does not support the audio element.
            </AudioPlayer>
          )}
          <ReactionContainer
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            {['👍', '❤️', '😂', '😮', '😢', '😡'].map((emoji) => (
              <ReactionButton
                key={emoji}
                onClick={() => handleReaction(emoji)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                disabled={updatingReaction === emoji}
              >
                {emoji} {localReactions[emoji] || 0}
                {updatingReaction === emoji && <span>...</span>}
              </ReactionButton>
            ))}
          </ReactionContainer>
          <CommentSection
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7 }}
            >
              Comments <CommentCount>({localComments.length})</CommentCount>
            </motion.h3>
            <CommentInput
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, 280))}
              placeholder="Add a comment... (max 280 characters)"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
            />
            <CharacterCount
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.9 }}
            >
              {newComment.length}/280
            </CharacterCount>
            <ReactionButton
              onClick={handleAddComment}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={newComment.trim().length === 0}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1 }}
            >
              Add Comment
            </ReactionButton>
            <CommentList>
              <AnimatePresence>
                {localComments.map((comment, index) => (
                  <CommentItem
                    key={comment.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ delay: 1.1 + index * 0.1 }}
                  >
                    <p>{comment.content}</p>
                    <small>{new Date(comment.timestamp).toLocaleString()}</small>
                  </CommentItem>
                ))}
              </AnimatePresence>
            </CommentList>
          </CommentSection>
        </ExpandedMessageContainer>
      </Overlay>
    </AnimatePresence>
  );
};

export default ExpandedMessage;