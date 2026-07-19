using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class AuditLogView : System.Windows.Controls.UserControl
{
    public AuditLogView(AuditLogViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.LoadCommand.ExecuteAsync(null);
    }
}
