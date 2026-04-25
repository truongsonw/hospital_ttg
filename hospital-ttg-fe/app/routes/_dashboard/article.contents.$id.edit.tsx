import { redirect } from 'react-router';

export function loader() {
  return redirect('/dashboard/article/contents');
}

export default function ArticleContentsEditPage() {
  return null;
}
