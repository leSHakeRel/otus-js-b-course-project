import { Link } from 'react-router-dom';
import { Card } from '@/components/common/Card';
import { Button } from '@/components/common/Button';

export const NotFound = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="max-w-md text-center">
        <div className="mb-4 text-6xl">🎬</div>
        <h1 className="mb-2 text-2xl font-bold text-dark-100">
          Страница не найдена
        </h1>
        <p className="mb-6 text-dark-400">
          К сожалению, страница, которую вы ищете, не существует.
        </p>
        <Link to="/">
          <Button variant="primary">Вернуться домой</Button>
        </Link>
      </Card>
    </div>
  );
};
