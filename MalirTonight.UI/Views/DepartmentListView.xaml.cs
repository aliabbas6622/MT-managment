using MalirTonight.UI.ViewModels;

namespace MalirTonight.UI.Views;

public partial class DepartmentListView : System.Windows.Controls.UserControl
{
    public DepartmentListView(DepartmentListViewModel viewModel)
    {
        InitializeComponent();
        DataContext = viewModel;
        Loaded += async (_, _) => await viewModel.LoadCommand.ExecuteAsync(null);
    }
}
