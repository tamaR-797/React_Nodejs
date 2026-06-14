import axiosInstance from './axiosInstance';

export interface Comment {
  id: string;
  author: string;
  authorAvatarUrl?: string | null;
  content: string;
  createdAt: string;
}

export interface Thread {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  repliesCount: number;
  category?: string;
}

export interface ThreadDetail {
  id: string;
  title: string;
  content: string;
  author: string;
  createdAt: string;
  category?: string;
  comments: Comment[];
}

export interface CreateThreadRequest {
  title: string;
  content: string;
  category: string;
}

export interface CreateCommentRequest {
  content: string;
}

export interface ThreadResponse {
  threads: Thread[];
  total: number;
  currentPage: number;
  totalPages: number;
}

interface RawAuthor {
  _id: string;
  name: string;
  email: string;
  avatarUrl?: string | null;
}

interface RawThread {
  _id: string;
  title: string;
  content: string;
  author: RawAuthor | string;
  createdAt: string;
  category?: string;
}

interface RawComment {
  _id: string;
  content: string;
  author: RawAuthor | string;
  createdAt: string;
}

interface ThreadListApiResponse {
  status: string;
  results: number;
  total: number;
  currentPage: number;
  totalPages: number;
  data: RawThread[];
}

interface ThreadDetailApiResponse {
  status: string;
  data: RawThread & { comments: RawComment[] };
}

interface CommentsApiResponse {
  status: string;
  results: number;
  data: RawComment[];
}

interface CommentCreateResponse {
  status: string;
  data: RawComment;
}

const mapAuthor = (author: RawAuthor | string): string => {
  if (typeof author === 'string') return author;
  return author.name || author.email || author._id;
};

const mapThread = (raw: RawThread & { repliesCount?: number }): Thread => ({
  id: raw._id,
  title: raw.title,
  content: raw.content,
  author: mapAuthor(raw.author),
  createdAt: raw.createdAt,
  repliesCount: raw.repliesCount ?? 0,
  category: raw.category,
});

const mapComment = (raw: RawComment): Comment => {
  const authorName = mapAuthor(raw.author);
  const authorAvatarUrl =
    typeof raw.author === 'object' ? raw.author.avatarUrl : undefined;
  return {
    id: raw._id,
    content: raw.content,
    author: authorName,
    authorAvatarUrl,
    createdAt: raw.createdAt,
  };
};

export const getThreads = async (page: number, searchTerm: string): Promise<ThreadResponse> => {
  const response = await axiosInstance.get<ThreadListApiResponse>('/threads', {
    params: {
      page,
      limit: 20,
      search: searchTerm || undefined,
    },
  });

  const { data, total, currentPage, totalPages } = response.data;

  return {
    threads: data.map(mapThread),
    total,
    currentPage,
    totalPages,
  };
};

export const createThread = async (payload: CreateThreadRequest): Promise<Thread> => {
  const response = await axiosInstance.post<{ status: string; data: RawThread }>('/threads', payload);
  return {
    ...mapThread(response.data.data),
    repliesCount: 0,
  };
};

export const getThreadById = async (threadId: string): Promise<ThreadDetail> => {
  const response = await axiosInstance.get<ThreadDetailApiResponse>(`/threads/${threadId}`);
  const raw = response.data.data;

  return {
    id: raw._id,
    title: raw.title,
    content: raw.content,
    author: mapAuthor(raw.author),
    createdAt: raw.createdAt,
    category: raw.category,
    comments: raw.comments ? raw.comments.map(mapComment) : [],
  };
};

export const getThreadComments = async (threadId: string): Promise<{ comments: Comment[] }> => {
  const response = await axiosInstance.get<CommentsApiResponse>(`/threads/${threadId}/comments`);
  return {
    comments: response.data.data.map(mapComment),
  };
};

export const postThreadComment = async (
  threadId: string,
  payload: CreateCommentRequest
): Promise<Comment> => {
  const response = await axiosInstance.post<CommentCreateResponse>(`/threads/${threadId}/comments`, payload);
  return mapComment(response.data.data);
};
