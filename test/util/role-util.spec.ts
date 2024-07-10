import { RoleUtil } from '@utils/role.util';

describe('RoleUtil', () => {
  it('Should return higher role as French format', async () => {
    expect(RoleUtil.getMainRoleName('admin,writer,lector')).toEqual(
      'Administrateur',
    );
    expect(RoleUtil.getMainRoleName('lector,writer')).toEqual('Éditeur');
    expect(RoleUtil.getMainRoleName('lector,')).toEqual('Lecteur');
  });
});
