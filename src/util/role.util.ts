export class RoleUtil {
  public static getMainRoleName(roles: string): string {
    const rolesSplit = roles.split(',');
    if (rolesSplit.includes('admin')) {
      return 'Administrateur';
    } else if (rolesSplit.includes('writer')) {
      return 'Éditeur';
    } else {
      return 'Lecteur';
    }
  }
}
