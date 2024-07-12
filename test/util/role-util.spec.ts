import { RoleUtil } from '@utils/role.util';
import { admin_account } from '@prisma/client';

describe('RoleUtil', () => {
  it('Should return higher role as French format', async () => {
    expect(RoleUtil.getMainRoleName('admin,writer,lector')).toEqual(
      'Administrateur',
    );
    expect(RoleUtil.getMainRoleName('lector,writer')).toEqual('Éditeur');
    expect(RoleUtil.getMainRoleName('lector,')).toEqual('Lecteur');
  });

  it('Should check that user can edit', async () => {
    const adminAccount = {} as admin_account;

    adminAccount.roles = 'admin,writer,lector';
    expect(RoleUtil.haveWriteRole(adminAccount)).toBeTruthy();

    adminAccount.roles = 'lector,writer';
    expect(RoleUtil.haveWriteRole(adminAccount)).toBeTruthy();

    adminAccount.roles = 'lector';
    expect(RoleUtil.haveWriteRole(adminAccount)).toBeFalsy();
  });
});
