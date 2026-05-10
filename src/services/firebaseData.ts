import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  setDoc,
  updateDoc,
  arrayUnion,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";
import type { ChatMessage, Conversation, User } from "../types/security";
import { firestore } from "./firebase";

const approvedUsersCollection = collection(firestore, "approved_users");
const pendingUsersCollection = collection(firestore, "pending_users");
const conversationsCollection = collection(firestore, "conversations");
const reportsCollection = collection(firestore, "reports");
const visitorsCollection = collection(firestore, "visitors");

export function subscribeApprovedUsers(callback: (users: User[]) => void) {
  return onSnapshot(approvedUsersCollection, (snapshot) => {
    const users = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })) as User[];
    callback(users);
  });
}

export function subscribePendingUsers(callback: (users: User[]) => void) {
  return onSnapshot(pendingUsersCollection, (snapshot) => {
    const users = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })) as User[];
    callback(users);
  });
}

export function subscribeConversations(callback: (conversations: Conversation[]) => void) {
  return onSnapshot(conversationsCollection, (snapshot) => {
    const conversations = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })) as Conversation[];
    callback(conversations);
  });
}

export function subscribeReports(callback: (reports: any[]) => void) {
  return onSnapshot(reportsCollection, (snapshot) => {
    const reports = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
    callback(reports);
  });
}

export function subscribeVisitors(callback: (visitors: any[]) => void) {
  return onSnapshot(visitorsCollection, (snapshot) => {
    const visitors = snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() }));
    callback(visitors);
  });
}

export async function ensureRemoteSeed(users: User[], conversations: Conversation[]) {
  const usersSnapshot = await getDocs(approvedUsersCollection);
  if (usersSnapshot.empty) {
    await Promise.all(
      users.map((user) => setDoc(doc(firestore, "approved_users", user.id), user)),
    );
  }

  const conversationsSnapshot = await getDocs(conversationsCollection);
  if (conversationsSnapshot.empty) {
    await Promise.all(
      conversations.map((conversation) =>
        setDoc(doc(firestore, "conversations", conversation.id), conversation),
      ),
    );
  }
}

export function saveApprovedUser(user: User) {
  return setDoc(doc(firestore, "approved_users", user.id), user);
}

export function savePendingUser(user: User) {
  return setDoc(doc(firestore, "pending_users", user.id), user);
}

export function deletePendingUserRemote(userId: string) {
  return deleteDoc(doc(firestore, "pending_users", userId));
}

export function deleteApprovedUserRemote(userId: string) {
  return deleteDoc(doc(firestore, "approved_users", userId));
}

export function saveConversation(conversation: Conversation) {
  return setDoc(doc(firestore, "conversations", conversation.id), conversation);
}

export function deleteConversationRemote(conversationId: string) {
  return deleteDoc(doc(firestore, "conversations", conversationId));
}

export function normalizeConversation(
  conversation: Conversation,
  message?: ChatMessage,
): Conversation {
  return {
    ...conversation,
    messages: message ? [...conversation.messages, message] : conversation.messages,
  };
}

// New functions for reports and visitors
export async function saveReport(reportId: string, reportData: any) {
  try {
    await setDoc(doc(firestore, "reports", reportId), {
      ...reportData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving report:", error);
    throw error;
  }
}

export async function deleteReport(reportId: string) {
  try {
    await deleteDoc(doc(firestore, "reports", reportId));
  } catch (error) {
    console.error("Error deleting report:", error);
    throw error;
  }
}

export async function saveVisitor(visitorId: string, visitorData: any) {
  try {
    await setDoc(doc(firestore, "visitors", visitorId), {
      ...visitorData,
      timestamp: serverTimestamp(),
      createdAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Error saving visitor:", error);
    throw error;
  }
}

export async function deleteVisitor(visitorId: string) {
  try {
    await deleteDoc(doc(firestore, "visitors", visitorId));
  } catch (error) {
    console.error("Error deleting visitor:", error);
    throw error;
  }
}

export async function updateVisitorStatus(visitorId: string, status: string) {
  try {
    await updateDoc(doc(firestore, "visitors", visitorId), {
      status: status,
    });
  } catch (error) {
    console.error("Error updating visitor status:", error);
    throw error;
  }
}
