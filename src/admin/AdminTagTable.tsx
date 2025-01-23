import FormWithConfirm from '@/components/FormWithConfirm';
import { deletePhotoTagGloballyAction } from '@/photo/serverFunctions';
import AdminTable from '@/admin/AdminTable';
import { Fragment } from 'react';
import { photoQuantityText } from '@/photo';
import { Tags, formatTag, sortTagsObject } from '@/tag';
import EditButton from '@/admin/EditButton';
import { pathForAdminTagEdit } from '@/site/paths';
import { clsx } from 'clsx/lite';
import AdminTagBadge from './AdminTagBadge';

export default function AdminTagTable({ tags }: { tags: Tags }) {
  return (
    <AdminTable>
      {sortTagsObject(tags).map(({ tag, count }) => (
        <Fragment key={tag}>
          <div className="col-span-2 pr-2">
            <AdminTagBadge {...{ tag, count }} />
          </div>
          <div className={clsx('flex flex-nowrap', 'items-center gap-2 sm:gap-3')}>
            <EditButton path={pathForAdminTagEdit(tag)} />
            <FormWithConfirm
              action={deletePhotoTagGloballyAction}
              confirmText={`Are you sure you want to remove "${formatTag(tag)}" from ${photoQuantityText(count, false).toLowerCase()}?`}
            >
              <input type="hidden" name="tag" value={tag} />
            </FormWithConfirm>
          </div>
        </Fragment>
      ))}
    </AdminTable>
  );
}
