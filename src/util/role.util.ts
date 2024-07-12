import { admin_account } from '@prisma/client';
import { RolesEnum } from '@enumerators/roles.enum';

export class RoleUtil {
  public static getMainRoleName(roles: string): string {
    const rolesSplit = roles.split(',');
    if (rolesSplit.includes(RolesEnum.Admin)) {
      return 'Administrateur';
    } else if (rolesSplit.includes(RolesEnum.Writer)) {
      return 'Éditeur';
    } else {
      return 'Lecteur';
    }
  }

  public static haveWriteRole(user: admin_account): boolean {
    return user.roles.split(',').includes(RolesEnum.Writer);
  }
}
